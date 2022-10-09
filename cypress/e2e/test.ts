import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on the homepage", () => {
  cy.visit("http://localhost:3000");
});

When("I type {} to {string} input", (value: number | string, inputName: string) => {
  cy.get(`input[name=${inputName}]`).type(`${value}`)
})

Then("I should see {string}", (text: string) => {
  cy.contains(text).should('be.visible')
});
