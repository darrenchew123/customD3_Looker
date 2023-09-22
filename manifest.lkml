project_name: "employee_project"

constant: VIS_LABEL {
  value: "Employee Status Chart"
  export: override_optional
}

constant: VIS_ID {
  value: "custom_viz"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  file: "employeeStatusChart.js"
  label: "@{VIS_LABEL}"
}
