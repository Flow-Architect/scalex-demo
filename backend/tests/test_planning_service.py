from app.services.planning_service import parse_planning_json


def test_parse_planning_json_extracts_object_from_wrapped_output() -> None:
    raw_output = """
Here is the ScaleX plan:
{
  "operating_plan": {"phases": ["Confirm invoice"]},
  "agent_task_list": [],
  "campaign_strategy": {"client": "Sample HVAC Co"},
  "executive_summary": "Plan the selected workflow safely.",
  "proposed_tool_sequence": ["job.create"]
}
Done.
"""

    parsed, error = parse_planning_json(raw_output)

    assert error is None
    assert parsed is not None
    assert parsed["campaign_strategy"]["client"] == "Sample HVAC Co"
