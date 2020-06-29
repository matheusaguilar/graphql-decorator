## Welcome to GitHub Pages

```javascript
import * as http from 'http';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { graphQlModel, graphQlPk, graphQlFk, graphQlColumn, graphQlQuery } from 'graphql-decorator/lib';

@graphQlModel()
export class State {
  @graphQlPk()
  public id: number = null;

  @graphQlColumn()
  public name: string = null;

  @graphQlColumn()
  public initials: string = null;
}

@graphQlModel()
export class City {
  @graphQlPk()
  public id: number = null;

  @graphQlColumn()
  public name: string = null;

  @graphQlFk()
  public state: State = null;
}

export class ResolverExample {
  @graphQlQuery({
    return: City
  })
  async getCity(cityId: number) {
    const city = new City();
    city.id = cityId;
    city.name = 'Awesome City';
    city.state = new State();
    city.state.id = 1;
  }
}

const app = express();
const httpServer = new http.Server(app);

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

const schemaBuilder = new SchemaBuilder((model: any) => {
  const state = new State();
  state.id = model.id;
  state.initials = 'EX';
  state.name = 'State name';
  return state;
})
.registerModels([State, City])
.registerResolvers([ResolverExample])
.buildSchema().then((graphqlSchema) => {
  app.use('/graphql', (req, res) =>
    graphqlHTTP({
      schema: graphqlSchema,
      graphiql: true,
      context: {
        req,
        res,
      },
    })(req, res)
  );
});
```

### Markdown

Markdown is a lightweight and easy-to-use syntax for styling your writing. It includes conventions for

```markdown
Syntax highlighted code block

# Header 1
## Header 2
### Header 3

- Bulleted
- List

1. Numbered
2. List

**Bold** and _Italic_ and `Code` text

[Link](url) and ![Image](src)
```

For more details see [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/).

### Jekyll Themes

Your Pages site will use the layout and styles from the Jekyll theme you have selected in your [repository settings](https://github.com/matheusaguilar/graphql-decorator/settings). The name of this theme is saved in the Jekyll `_config.yml` configuration file.

### Support or Contact

Having trouble with Pages? Check out our [documentation](https://help.github.com/categories/github-pages-basics/) or [contact support](https://github.com/contact) and we’ll help you sort it out.
