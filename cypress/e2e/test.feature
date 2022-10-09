Feature: Position sizing
  Scenario: visiting the page
    Given I am on the homepage
    Then I should see "Position sizing"
    And I should see "Max $ loss: 0$"
    And I should see "Stock quantity: 0"
    When I type 10000 to "balance" input
    And I type 2 to "maxloss" input
    Then I should see "Max $ loss: 200$"
    When I type 50 to "entry" input
    And I type 45 to "stoploss" input
    Then I should see "Stock quantity: 40"