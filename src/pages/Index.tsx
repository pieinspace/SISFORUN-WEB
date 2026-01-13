import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to dashboard - login state is managed in App.tsx
  return <Navigate to="/" replace />;
};

export default Index;
