import * as Yup from "yup";

export const profileValidationSchema = Yup.object({
  fullName: Yup.string()
    .min(3, "Full Name must be at least 3 characters")
    .max(50, "Full Name must be at most 50 characters")
    .required("Full Name is required"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),

  address: Yup.string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters")
    .required("Address is required"),

});

export const validationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .required("Full name is required"),
  email: Yup.string()
  .trim()
    .email("Invalid email address")
    .required("Email is required"),
  department: Yup.string()
    .trim()
    .required("Department is required"),
  role: Yup.string()
    .oneOf(["hr", "developer", "projectManager"], "Invalid role")
    .required("Role is required"),
  status: Yup.string()
  .trim()
  .required("Status is required"),
  salary : Yup.number()
  .required("Salary is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .required("Phone is required"),
  address: Yup.string().optional(),
  manager: Yup.string().optional(),
  joinedAt: Yup.date().optional(),  
});
