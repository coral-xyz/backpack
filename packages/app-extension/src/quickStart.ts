export {};
(() => {
  const darkMode = true;
  const styleNode = document.createElement("style");
  styleNode.innerHTML = `
      #root,
      body,
      html {
         position: relative;
         width: 100%;
         height: 100%;
         min-height: 600px;
         min-width: 375px;
         margin: 0;
         padding: 0;
         background: ${
           darkMode ? "rgba(20, 21, 27, 1)" : "rgba(244, 244, 246, 1)"
         };
      }
   `;
  document.head.appendChild(styleNode);
  console.log(`
                      d####b
                   d##########b

                d################b
            d#######################b
          d###########^''''^##########b
         d##########b        d##########b
        d##########b          d##########b
        ############b        d############
        ##############b....d##############
        ##################################
        ##################################
        ##################################
        ##################################
         ################################

         ################################
        ##################################
        ##################################
        ##################################
        ##################################
         ################################

         Backpack - A home for your xNFTs

              https://backpack.app
       https://github.com/coral-xyz/backpack

  DO NOT COPY OR PASTE ANYTHING AS INSTRUCTED BY
             ANOTHER PERSON IN HERE!
`);
})();
