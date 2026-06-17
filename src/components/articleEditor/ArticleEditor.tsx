import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Article, createArticle, updateArticle } from "api/articles";
import { ApiError } from "api/client";
import { useAppSelector } from "store";

function messagesFromErrorBody(body: unknown): string[] {
  if (body == null || typeof body !== "object" || !("errors" in body)) {
    return [];
  }
  const errors = (body as { errors: Record<string, string[] | string> }).errors;
  return Object.values(errors).flatMap((v) => (Array.isArray(v) ? v : [String(v)]));
}

function parseTagList(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");
}

export default function ArticleEditor({ article }: { article: Article | null }) {
  const navigate = useNavigate();
  const token = useAppSelector((state) => state.auth.token);
  const [title, setTitle] = useState(article?.title || "");
  const [description, setDescription] = useState(article?.description || "");
  const [body, setBody] = useState(article?.body || "");
  const [tags, setTags] = useState(article?.tagList.join(",") || "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessages([]);

    if (token == null || token === "") {
      setErrorMessages(["You must be signed in to publish an article."]);
      return;
    }

    const tagList = parseTagList(tags);
    setSubmitting(true);
    try {
      const { article: articleResponse } = article 
      ? await updateArticle(article.slug, {
        title: title.trim(),
        description: description.trim(),
        body,
        ...(tagList.length > 0 ? { tagList } : {}),
      }, { token })
      : await createArticle(
        {
          title: title.trim(),
          description: description.trim(),
          body,
          ...(tagList.length > 0 ? { tagList } : {}),
        },
        { token }
      );
      navigate(`/${encodeURIComponent(articleResponse.slug)}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const fromApi = messagesFromErrorBody(err.body);
        setErrorMessages(fromApi.length > 0 ? fromApi : [err.message]);
      } else {
        setErrorMessages(["Something went wrong. Please try again."]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="editor-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-10 offset-md-1 col-xs-12">
              <form onSubmit={handleSubmit}> 
                <fieldset>
                  {errorMessages.length > 0 ? (
                    <ul className="error-messages">
                      {errorMessages.map((msg, i) => (
                        <li key={`${i}-${msg}`}>{msg}</li>
                      ))}
                    </ul>
                  ) : null}
                  <fieldset className="form-group">
                    <input type="text" className="form-control form-control-lg" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </fieldset>
                  <fieldset className="form-group">
                    <input type="text" className="form-control" placeholder="What's this article about?" value={description} onChange={(e) => setDescription(e.target.value)} />
                  </fieldset>
                  <fieldset className="form-group">
                    <textarea className="form-control" rows={8} placeholder="Write your article (in markdown)" value={body} onChange={(e) => setBody(e.target.value)} />
                  </fieldset>
                  <fieldset className="form-group">
                    <input type="text" className="form-control" placeholder="Enter tags" value={tags} onChange={(e) => setTags(e.target.value)} />
                    <div className="tag-list" />
                  </fieldset>
                  <button className="btn btn-lg pull-xs-right btn-primary" type="submit" disabled={submitting}>
                    {article ? "Edit" : "Publish"} Article
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
}
