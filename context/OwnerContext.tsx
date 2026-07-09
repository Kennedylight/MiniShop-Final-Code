
import { createContext, useContext, useState } from "react";

const OwnerContext = createContext<any>(null);

export const OwnerProvider = ({ children }) => {
  const [owner, setOwner] = useState(null);
  return (
    <OwnerContext.Provider value={{ owner, setOwner }}>
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwner = () => useContext(OwnerContext);
