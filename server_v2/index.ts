import app from './webhook';
const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`ai-webhook-v2 listening on :${port}`));


