import LoginForm from "../../../components/LoginForm";


const AdminLoginPage = () => {
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="hidden md:block w-1/2 bg-blue-200 p-8">
          <div className="w-full h-full flex items-center justify-center">
            <img
              src="https://res.cloudinary.com/dr0iflvfs/image/upload/v1741277371/premium_vector-1726234498056-8a704b750025_qovekf.avif"
              alt="Office illustration"
              className="object-cover"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <LoginForm role="admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;