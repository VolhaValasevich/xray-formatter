Feature: Feature

  @jira(PC-1) @PC-1
  Scenario: Passed Test
    When passed step
    And passed step

  @jira(PC-2) @PC-2
  Scenario: Failed Test
    When passed step
    And failed step

  @jira(PC-3) @PC-3
  Scenario Outline: Passed Outline
    When <result> step
    Examples:
      | result |
      | passed |
      | passed |

  @jira(PC-4) @PC-4
  Scenario Outline: Failed Outline
    When <result> step
    Examples:
      | result |
      | passed |
      | failed |

  Scenario: Test without any tags
    When passed step

  @smoke
  Scenario: Test without jira tags
    When passed step

  @jira(DP-1) @DP-1
  Scenario: Test with a different project code
    When passed step

  @jira(PC-5) @PC-5
  Scenario: Test passed after retry
    When step passed after retry

  @jira(PC-6) @PC-6
  Scenario: Test with an undefined step
    When passed step
    And undefined step
