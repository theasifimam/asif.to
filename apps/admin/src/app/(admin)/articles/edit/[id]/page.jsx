import ArticleForm from "../../components/ArticleForm";
export default async function EditArticlePage({ params }) { const { id } = await params; return <ArticleForm articleId={id} />; }
