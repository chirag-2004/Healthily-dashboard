import React from "react";
import Header from "../../_components/Header";

const layout = ({ children }) => {
  return (
    <>
      <Header />
      <div>{children}</div>
    </>
  );
};

export default layout;