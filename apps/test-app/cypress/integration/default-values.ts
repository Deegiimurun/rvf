describe("Validation", () => {
  it("should propagate default values to inputs", () => {
    cy.visit("/default-values").waitForJs();
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
    cy.findByLabelText("Likes Pizza").should("be.checked");
    // Label text seems to grab the wrong input for some reason
    cy.findByTestId("red").should("be.checked");
    cy.findByTestId("green").should("be.checked");
    cy.findByTestId("blue").should("not.be.checked");
    cy.findByTestId("cake").should("be.checked");
    cy.findByTestId("iceCream").should("not.be.checked");
  });

  it("should propagate default values to inputs without JS", () => {
    cy.visitWithoutJs("/default-values");
    cy.findByLabelText("First Name").should("have.value", "Jane");
    cy.findByLabelText("Last Name").should("have.value", "Doe");
    cy.findByLabelText("Email").should("have.value", "jane.doe@example.com");
    cy.findByLabelText("Age").should("have.value", "26");
    cy.findByLabelText("Likes Pizza").should("be.checked");
    cy.findByTestId("red").should("be.checked");
    cy.findByTestId("green").should("be.checked");
    cy.findByTestId("blue").should("not.be.checked");
    cy.findByTestId("cake").should("be.checked");
    cy.findByTestId("iceCream").should("not.be.checked");
  });

  it("should populate default values on external fields", () => {
    cy.visit("/default-values-external");
    cy.findByLabelText("Text 1").should("have.value", "John");
    cy.findByLabelText("Text 2").should("have.value", "Bob");
    cy.findByLabelText("Check 1").should("be.checked");
    cy.findByTestId("value1").should("not.be.checked");
    cy.findByTestId("value2").should("not.be.checked");
    cy.findByTestId("value3").should("be.checked");
    cy.findByTestId("red").should("be.checked");
    cy.findByTestId("blue").should("not.be.checked");
    cy.findByTestId("green").should("be.checked");
  });

  it("should still populate default values on external fields without JS", () => {
    cy.visitWithoutJs("/default-values-external");
    cy.findByLabelText("Text 1").should("have.value", "John");
    cy.findByLabelText("Text 2").should("have.value", "Bob");
    cy.findByLabelText("Check 1").should("be.checked");
    cy.findByTestId("value1").should("not.be.checked");
    cy.findByTestId("value2").should("not.be.checked");
    cy.findByTestId("value3").should("be.checked");
    cy.findByTestId("red").should("be.checked");
    cy.findByTestId("blue").should("not.be.checked");
    cy.findByTestId("green").should("be.checked");
  });

  it("should maintain default value after the first render for nested values", () => {
    cy.visit("/nested-defaults").waitForJs();
    cy.findByTestId("check").should("contain", '"defaultChecked": true');
    cy.findByTestId("nestedCheckTrue").should(
      "contain",
      '"defaultChecked": true',
    );
    cy.findByTestId("nestedCheckFalse").should(
      "contain",
      '"defaultChecked": false',
    );
  });

  it("should not fail when encountering non-object loader data", () => {
    cy.visit("/non-object-loader-data").waitForJs();
    cy.findByLabelText("Text").should("have.value", "");
  });
});
