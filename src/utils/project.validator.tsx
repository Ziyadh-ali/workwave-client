import * as yup from "yup"

const today = new Date();
today.setHours(0, 0, 0, 0);

export const projectSchema = yup.object({
  name: yup.string().required("Project name is required"),
  startDate: yup
    .date()
    .required("Start date is required")
    .typeError("Start date must be a valid date")
    .min(today, "Start date cannot be in the past"),
  endDate: yup
    .date()
    .typeError("End date must be a valid date")
    .required("End date is required")
    .when("startDate", ([startDate], schema: yup.DateSchema<Date>) => {
      return startDate
        ? schema.min(startDate, "End date cannot be before start date")
        : schema;
    }),
  members: yup
    .array()
    .of(yup.string().required("Invalid member ID"))
    .min(1, "At least one member is required")
    .required("Members are required"),
});