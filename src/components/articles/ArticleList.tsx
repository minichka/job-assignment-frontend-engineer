import type { Article } from "../../features/articles/articlesSlice";
import ArticleItem from "./ArticleItem";
import TagsSidebar from "./TagsSidebar";


type ArticleListProps = {
  articles: Article[];
};

export default function ArticleList({ articles }: ArticleListProps) {
  return (
    <div className="home-page">
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <a className="nav-link disabled" href="">
                      Your Feed
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link active" href="">
                      Global Feed
                    </a>
                  </li>
                </ul>
              </div>

              {articles.map((article) => <ArticleItem key={article.slug} article={article} />)}
            </div>

            <TagsSidebar />
          </div>
        </div>
      </div>
  );
}
