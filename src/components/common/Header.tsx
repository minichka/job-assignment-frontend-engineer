import { NavLink } from "react-router-dom";

import { useAppSelector } from "store";

function navLinkClass(isActive: boolean): string {
  return `nav-link${isActive ? " active" : ""}`;
}

export default function Header() {
  const user = useAppSelector((state) => state.auth.user);
  const initialized = useAppSelector((state) => state.auth.initialized);
  const loggedIn = initialized && user != null;

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <NavLink className="navbar-brand" to="/">
          conduit
        </NavLink>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <NavLink className={({ isActive }) => navLinkClass(isActive)} end to="/">
              Home
            </NavLink>
          </li>
          {loggedIn ? (
            <>
              <li className="nav-item">
                <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/editor">
                  <i className="ion-compose" />
                  &nbsp;New Article
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/settings">
                  <i className="ion-gear-a" />
                  &nbsp;Settings
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) => navLinkClass(isActive)}
                  to={`/profile/${encodeURIComponent(user.username)}`}
                >
                  {user.username}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/logout">
                  Sign out
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/login">
                  Sign in
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => navLinkClass(isActive)} to="/register">
                  Sign up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
