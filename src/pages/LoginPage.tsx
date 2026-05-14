import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "features/auth/authSlice";
import { useAppDispatch } from "store";

function messagesFromErrorBody(body: unknown): string[] {
  if (body == null || typeof body !== "object" || !("errors" in body)) {
    return [];
  }
  const errors = (body as { errors: Record<string, string[] | string> }).errors;
  return Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessages([]);
    setSubmitting(true);
    const resultAction = await dispatch(
      login({ email: email.trim(), password })
    );
    setSubmitting(false);

    if (login.fulfilled.match(resultAction)) {
      navigate("/", { replace: true });
      return;
    }

    const payload = resultAction.payload;
    const fromApi = messagesFromErrorBody(payload);
    setErrorMessages(
      fromApi.length > 0 ? fromApi : ["Email or password is invalid."]
    );
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <p className="text-xs-center">
              <Link className="logo-font" to="/">
                conduit
              </Link>
            </p>
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>

            {errorMessages.length > 0 ? (
              <ul className="error-messages">
                {errorMessages.map((msg, i) => (
                  <li key={`${i}-${msg}`}>{msg}</li>
                ))}
              </ul>
            ) : null}

            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  autoComplete="email"
                  required
                />
              </fieldset>
              <fieldset className="form-group">
                <input
                  className="form-control form-control-lg"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  autoComplete="current-password"
                  required
                />
              </fieldset>
              <button
                type="submit"
                className="btn btn-lg btn-primary pull-xs-right"
                disabled={submitting}
              >
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
