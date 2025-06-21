describe('Paw-zal E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
    cy.viewport(1280, 800);
  });

  it('executes', () => {

    //login
    cy.get('[data-cy=login-field]').type('admin');
    cy.get('[data-cy=pass-field]').type('admin123')
    cy.wait(2000);
    cy.get('[data-cy=login-button]').click();
    cy.wait(2000);

    //create project
    cy.get('[data-cy=project-name]').type('New Project');
    cy.get('[data-cy=save-project]').click();
    cy.contains('New Project').should('exist');

    //create story
    cy.contains('New Project').click();
    cy.get('[data-cy=create-story]').click();
    cy.get('[data-cy=story-name]').type('User Login');
    cy.get('[data-cy=save-story]').click();
    cy.contains('User Login').should('exist');

    //create task
    cy.reload();
    cy.wait(2000);
    cy.contains('New Project').click();
    cy.get('[data-cy=create-task]').click();
    cy.get('[data-cy=task-name]').type('Design login form');
    cy.get('[data-cy=select-story]').select('User Login')
    cy.get('[data-cy=save-task]').click();
    cy.contains('Design login form').should('exist');

    //change story status
    cy.wait(2000);
    cy.get('[data-cy=edit-story-icon]').click();
    cy.get('[data-cy=edit-story]').select("doing");
    cy.get('[data-cy=save-story]').click();

    //edit task, story, project
    cy.get('[data-cy=edit-task-icon]').click()
    cy.get('[data-cy=task-name]').clear().type('Design login UI');
    cy.get('[data-cy=save-task]').click();
    cy.contains('Design login UI').should('exist');

    cy.get('[data-cy=edit-story-icon]').click();
    cy.get('[data-cy=story-name]').clear().type('User Auth');
    cy.get('[data-cy=save-story]').click();
    cy.contains('User Auth').should('exist');

    cy.contains('New Project').click();
    cy.get('[data-cy=edit-project-icon]').click();
    cy.get('[data-cy=project-name]').clear().type('Authentication Project');
    cy.get('[data-cy=save-project]').click();
    cy.contains('Authentication Project').should('exist');

    //delete task,story,project
    cy.get('[data-cy=delete-task]').click();
    cy.contains('Design login UI').should('not.exist');

    cy.get('[data-cy=delete-story]').click();
    cy.contains('User Auth').should('not.exist');

    cy.get('[data-cy=delete-project]').click();
    cy.contains('Authentication Project').should('not.exist');
  });
});
