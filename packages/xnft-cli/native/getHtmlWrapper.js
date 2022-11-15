module.exports = (js) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
    <style>
      html, body {
        position:relative;
        margin: 0;
        padding: 0;
        height:100%;
        display:flex;
        flex-direction: column;
      }
      #native-container {
        display:none;
        flex-direction: column;
        flex: 1 0 100%;
      }
    </style>
  </head>
  <title>simulator</title>
  <body>
    <div id="native-container"></div>
    <div id="container"></div>
    <script>${js}</script>
    <script src="https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@latest/dist/index.js"></script>
  </body>
</html>
`;
