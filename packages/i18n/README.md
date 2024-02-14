# How to add translations

### ONLY EDIT `en.json` DIRECTLY. DO NOT EDIT THE OTHER TRANSLATION FILES.

1. Add your translation in code using `t()`, below is an example where `this_is_an_example` gets created.

```javascript
import { useTranslation } from "@coral-xyz/i18n";

function Component() {
  const { t } = useTranslation();
  return <h1>{t("this_is_an_example")}</h1>;
}
```

2. Add the key and value into the JSON file `./locales/en.json`

```diff
{
  ...
+  "this_is_an_example": "This is an example"
}
```

3. Commit your changes and create a GitHub Pull Request

4. Once your Pull Request is merged into `master` your new keys will be added to a translation service. After a translator has translated your key(s), a GitHub action will add those translations into the corresponding language JSON files and merge the changes into master.
