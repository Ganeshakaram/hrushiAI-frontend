// App.js
import { useState } from "react";
import Auth from "./Components/AuthComp"; 
import MyForm from "./Components/MyForm";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      {!isAuthenticated ? (
        <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <MyForm />
      )}
    </div>
  );
}

export default App;
