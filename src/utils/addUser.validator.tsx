import * as Yup from "yup";

export const addUserSchema = Yup.object({
    fullName: Yup.string()
        .trim()
        .required("Name is required")
        .min(3, "name should be atleast 3 letters long")
        .matches(/^[A-Za-z\s]+$/, "Name should only contain letters and spaces"),

    email: Yup.string()
        .trim()
        .email("Invalid email address")
        .required("Email is required"),

    role: Yup.string()
        .trim()
        .required("Role is required"),

    department: Yup.string()
        .trim()
        .required("Department is required"),

    password: Yup.string()
        .trim()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),

    confirmPassword: Yup.string()
        .trim()
        .required("Confirm Password is required")
        .oneOf([Yup.ref("password"), "null"], "Passwords must match"),
    salary: Yup.number()
        .typeError("Salary must be a number")
        .required("Salary is required")
        .positive("Salary must be positive")
        .min(1000, "Salary should be min 1000")
        .max(1000000, "Salary seems too high")
});