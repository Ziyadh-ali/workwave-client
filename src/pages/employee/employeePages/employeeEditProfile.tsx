import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { profileValidationSchema } from "../../../utils/editValidation";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import { getProfileDetails, updateProfileService } from "../../../services/user/userService";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { ErrorBoundary } from 'react-error-boundary';
import Sidebar from "../../../components/SidebarComponent";
import { employeeLogin } from "../../../store/slices/employeeSlice";


const EditProfilePage = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { employee } = useSelector((state: RootState) => state.employee);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const originalValueRef = useRef<Partial<typeof formik.values>>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getProfileDetails(employee?._id || "");
        const values = {
          fullName: response.details.fullName || "",
          email: response.details.email || "",
          phone: response.details.phone.toString() || "",
          address: response.details.address || "",
          profilePic: response.details.profilePic || "",
        };
        console.log(values)
        formik.setValues(values);
        originalValueRef.current = values
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
    // eslint-disable-next-line
  }, [employee?._id]);


  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      profilePic: "",
    },
    validationSchema: profileValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {

      try {
        const changedTextFields = Object.entries(values).filter(([key, value]) => {
          if (key === "profilePic") return false;
          const original = originalValueRef.current[key as keyof typeof values];
          return value !== original;
        });

        const profilePicChanged = typeof values.profilePic !== "string";

        if (changedTextFields.length === 0 && !profilePicChanged) {
          enqueueSnackbar("No changes made", { variant: "info" });
          setSubmitting(false);
          navigate("/profile");
          return;
        }

        const formData = new FormData();
        changedTextFields.forEach(([key, value]) => {
          formData.append(key, value);
        });

        if (profilePicChanged && values.profilePic) {
          formData.append("profilePic", values.profilePic);
        }
        const employeeId = employee?._id ? employee._id : "";

        const response = await updateProfileService(employeeId, formData);
        const data = response.newData;
        dispatch(employeeLogin({
          _id: data._id,
          email: data.email,
          fullName: data.fullName,
          profilePic: data.profilePic,
          role: data.role
        }));
        enqueueSnackbar(response.message, { variant: "success" });
        navigate("/profile");
      } catch (error) {
        console.error("FULL Submission Error:", error);
        enqueueSnackbar("An error occurred during submission", { variant: "error" });
      } finally {
        setSubmitting(false);
      }
    },
  });


  return (
    <ErrorBoundary
      fallback={<div>Something went wrong</div>}
      onError={(error, info) => {
        console.error("Error caught by boundary:", error);
        console.error("Component stack:", info);
      }}
    >
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar role="employee" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                formik.handleSubmit(e);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input {...formik.getFieldProps("fullName")} placeholder="Enter your full name" />
                {formik.touched.fullName && formik.errors.fullName && (
                  <div className="text-red-500 text-sm">{formik.errors.fullName}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input {...formik.getFieldProps("email")} type="email" placeholder="Enter your email" disabled />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input {...formik.getFieldProps("phone")} placeholder="Enter your phone number" />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Address</label>
                <Input {...formik.getFieldProps("address")} placeholder="Enter your address" />
                {formik.touched.address && formik.errors.address && (
                  <div className="text-red-500 text-sm">{formik.errors.address}</div>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
                  {formik.values.profilePic && typeof formik.values.profilePic !== "string" ? (
                    <img
                      src={URL.createObjectURL(formik.values.profilePic)}
                      alt="Profile Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : employee?._id ? (
                    console.log(
                      `https://res.cloudinary.com/dr0iflvfs/image/upload/${formik.values.profilePic}/user_profiles/employees/${employee?._id}`
                    ),
                    <img
                      src={
                        typeof formik.values.profilePic === "string" && formik.values.profilePic !== "" && employee?._id
                          ? `https://res.cloudinary.com/dr0iflvfs/image/upload/v${formik.values.profilePic}/user_profiles/employees/${employee._id}`
                          : "https://via.placeholder.com/100"
                      }
                      alt="Profile Preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/100"
                      alt="Profile Preview"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      if (event.currentTarget.files?.[0]) {
                        formik.setFieldValue("profilePic", event.currentTarget.files[0]);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formik.touched.profilePic && formik.errors.profilePic && (
                    <div className="text-red-500 text-sm">{formik.errors.profilePic}</div>
                  )}
                </div>
              </div>


              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate("/profile")}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formik.isSubmitting || loading}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>

  );
};

export default EditProfilePage;