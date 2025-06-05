import LoginForm from "../../../components/LoginForm";

const EmployeeLoginPage = () => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-blue-200 p-8">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dr0iflvfs/image/upload/v1742613206/video-conference-theme-multiracial-business-600nw-1932607703_k7jyyg.webp"
              alt="Office illustration"
              className="object-cover"
            />
          </div>
        </div>
        

        <div className="w-full md:w-1/2 p-8">
          <LoginForm role="employee" />
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;