import { ReactNode } from "react";

const PageWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <div className="article-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-12 text-xs-center" style={{ padding: "4rem 0" }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default PageWrapper;