using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using PawApi.Models;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

var mockUserStore = new List<User>
{
    new User { Id = "user-admin-01", Login = "admin", PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), Role = "admin", FirstName = "Jan", LastName = "Kowalski" },
    new User { Id = "user-dev-01", Login = "dev1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("devpass"), Role = "developer", FirstName = "Anna", LastName = "Nowak" },
    new User { Id = "user-devops-01", Login = "ops1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("opspass"), Role = "devops", FirstName = "Piotr", LastName = "Zieliński" }
};
builder.Services.AddSingleton(mockUserStore);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsLongEnough";
    var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "YourAuthService";
    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "YourApiClient";

    if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 16)
    {
        throw new InvalidOperationException("JWT Key must be configured and at least 16 characters long.");
    }

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


string GenerateJwtToken(User user, IConfiguration config)
{
    var jwtKey = config["Jwt:Key"] ?? "YourSuperSecretKeyThatIsLongEnough";
    var jwtIssuer = config["Jwt:Issuer"] ?? "YourAuthService";
    var jwtAudience = config["Jwt:Audience"] ?? "YourApiClient";

    var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Name, user.Login),
        new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
        new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtAudience,
        claims: claims,
        expires: DateTime.Now.AddMinutes(15),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}

string GenerateRefreshToken()
{
    return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
}


var authGroup = app.MapGroup("/auth");

authGroup.MapPost("/login", ([FromBody] LoginRequest loginRequest, List<User> userStore, IConfiguration config) =>
{
    var user = userStore.FirstOrDefault(u => u.Login.Equals(loginRequest.Login, StringComparison.OrdinalIgnoreCase));

    if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
    {
        return Results.Unauthorized();
    }

    var accessToken = GenerateJwtToken(user, config);
    var refreshToken = GenerateRefreshToken();

    return Results.Ok(new TokenResponse { AccessToken = accessToken, RefreshToken = refreshToken });
})
.WithName("Login")
.WithTags("Authentication")
.AllowAnonymous();

authGroup.MapPost("/refresh", ([FromBody] TokenResponse tokenRequest, List<User> userStore, IConfiguration config) =>
{
    var user = userStore.FirstOrDefault();
    if (user == null) return Results.Unauthorized();

    var newAccessToken = GenerateJwtToken(user, config);
    var newRefreshToken = GenerateRefreshToken();

    return Results.Ok(new TokenResponse { AccessToken = newAccessToken, RefreshToken = newRefreshToken });
})
.WithName("RefreshToken")
.WithTags("Authentication")
.AllowAnonymous();


app.MapGet("/users/me", (ClaimsPrincipal claimsPrincipal, List<User> userStore) =>
{
    var userId = claimsPrincipal.FindFirstValue(JwtRegisteredClaimNames.Sub);
    if (string.IsNullOrEmpty(userId))
    {
        return Results.Unauthorized();
    }

    var user = userStore.FirstOrDefault(u => u.Id == userId);
    if (user == null)
    {
        return Results.NotFound("User not found.");
    }

    var userResponse = new
    {
        user.Id,
        user.Login,
        user.Role,
        user.FirstName,
        user.LastName
    };
    return Results.Ok(userResponse);
})
.WithName("GetMe")
.WithTags("Users")
.RequireAuthorization();


app.Run();
