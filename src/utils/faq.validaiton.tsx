import * as Yup from "yup";

export const faqValidationSchema = Yup.object().shape({
  topic: Yup.string()
    .required("Topic is required")
    .min(3, "Topic must be at least 3 characters"),
  
  description: Yup.string()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters"),
  
  questions: Yup.array()
    .of(
      Yup.object().shape({
        question: Yup.string()
          .required("Question is required")
          .min(5, "Question must be at least 5 characters"),
        answer: Yup.string()
          .required("Answer is required")
          .min(5, "Answer must be at least 5 characters"),
      })
    )
    .min(1, "At least one question is required"),
});
