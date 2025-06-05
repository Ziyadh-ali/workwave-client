
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { useFormik } from "formik"
import { addUserSchema } from "../../../utils/addUser.validator"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface AddUserModalProps {
  onAddUser: (userData: {
    fullName: string
    email: string
    role: string
    department: string
    password: string
    salary: number
  }) => void
}

const AddUserModal = ({ onAddUser }: AddUserModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      role: "",
      department: "",
      password: "",
      confirmPassword: "",
      salary: 0,
    },
    validationSchema: addUserSchema,
    onSubmit: (values) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userData } = values
      onAddUser(userData);
    },
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white">+ Add Employee</Button>
      </DialogTrigger>
      <DialogContent
        className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto
         scrollbar-hidden
        hover:scrollbar-thumb-black-400 scrollbar-thumb-rounded-full"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Full Name *
            </Label>
            <Input
              id="name"
              name="fullName"
              placeholder="Enter name"
              className="w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.fullName}
            />
            {formik.touched.fullName && formik.errors.fullName ? (
              <div className="text-red-500 text-sm">{formik.errors.fullName}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              className="w-full"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm">{formik.errors.email}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role *
            </Label>
            <Select
              name="role"
              value={formik.values.role}
              onValueChange={(value) => formik.setFieldValue("role", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR Manager</SelectItem>
                <SelectItem value="projectManager">Project Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.role && formik.errors.role ? (
              <div className="text-red-500 text-sm">{formik.errors.role}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-gray-700">
              Department *
            </Label>
            <Select
              name="department"
              value={formik.values.department}
              onValueChange={(value) => formik.setFieldValue("department", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="softwareDeveloper">Software Development</SelectItem>
                <SelectItem value="projectManagement">Project Management</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.department && formik.errors.department ? (
              <div className="text-red-500 text-sm">{formik.errors.department}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-sm font-medium text-gray-700">
              Salary *
            </Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              min="0"
              placeholder="Enter salary amount"
              className="w-full"
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                formik.setFieldValue("salary", value >= 0 ? value : 0);
              }}
              onBlur={formik.handleBlur}
              value={formik.values.salary}
            />
            {formik.touched.salary && formik.errors.salary ? (
              <div className="text-red-500 text-sm">{formik.errors.salary}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password *
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className="w-full pr-10"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm">{formik.errors.password}</div>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showCPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full pr-10"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowCPassword(!showCPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
              >
                {showCPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-red-500 text-sm">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>
          <Button type="submit" className="w-full bg-blue-600 text-white">
            Add User
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserModal

