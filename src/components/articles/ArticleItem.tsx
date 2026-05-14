import { Article } from "api/articles";
import { Link } from "react-router-dom";

const PLACEHOLDER_AVATAR = "http://i.imgur.com/Qr71crq.jpg";

const ArticleItem = ({ article }: { article: Article }) => {
    return (
        <div key={article.slug} className="article-preview">
            <div className="article-meta">
                <Link to={`/profile/${encodeURIComponent(article.author.username)}`}>
                    <img src={article.author.image || PLACEHOLDER_AVATAR} alt="" />
                </Link>
                <div className="info">
                    <Link
                        to={`/profile/${encodeURIComponent(article.author.username)}`}
                        className="author"
                    >
                        {article.author.username}
                    </Link>
                    <span className="date">
                        {new Date(article.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
                <button type="button" className="btn btn-outline-primary btn-sm pull-xs-right">
                    <i className="ion-heart" /> {article.favoritesCount}
                </button>
            </div>
            <Link to={`/${encodeURIComponent(article.slug)}`} className="preview-link">
                <h1>{article.title}</h1>
                <p>{article.description}</p>
                <span>Read more...</span>
            </Link>
        </div>
    );
};

export default ArticleItem;