## GraphQl-Decorator

[GraphQlPage](https://matheusaguilar.github.io/graphql-decorator/)

GraphQl is awesome, but create schemas are boring. In this project I try to do your life easier with Decorators of Typescript.

What you need? Only a model and resolver.

First of all, we need to know the types that we can use, we have Basic types and Model types.

Basic types: **String, Number** and **Boolean**

Model Types: Are the models that's decorated with **@graphQlModel()** 

### Models
For models we have the decorators:

* **@graphQlModel**: Defines a model type of graphQL.

* **@graphQlPk**: Defines the attribute that's used to resolve this model.

* **@graphQlColumn**: Defines one attribute of the model.

* **@graphQlFk**: Define a foreign model that will need be resolved.

```javascript
import { graphQlModel, graphQlPk, graphQlFk, graphQlColumn } from 'graphql-decorator/lib';

@graphQlModel()
export class State {
  @graphQlPk()
  public id: number;

  @graphQlColumn()
  public name: string;

  @graphQlColumn()
  public initial: string;
}

@graphQlModel()
export class City {
  @graphQlPk()
  public id: number;

  @graphQlColumn()
  public name: string;

  @graphQlFk()
  public state: State;
}
```

#### Resolvers
Resolvers have decorators for functions of the class:

* **@graphQlQuery**: Create a GraphQL query.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  return |  Define the type of the return of the query. Can be any one of the types: **String, Number, Boolean** or Some Model(**@graphQlModel**) |
|  name? |  Define the name of the query that will be created, if not provided the query will use the function name. |

```javascript
export class ResolverQueryExample {
  @graphQlQuery({
    name: 'queryCity'
    return: City
  })
  async getCity(cityId: number) {
    const city = new City();
    city.id = cityId;
    city.name = 'Awesome City';
    return city;
  }
}
```

* **@graphQlMutation**: Create a GraphQL mutation.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  return |  Define the type of the return of the query. Can be any one of the types: **String, Number, Boolean** or Some Model(**@graphQlModel**) |
|  name? |  Define the name of the query that will be created, if not provided the query will use the function name. |

```javascript
export class ResolverMutationExample {
  @graphQlMutation({
    return: Boolean
  })
  async createCity(city: City) {
    const databaseCity: any = {}; // database call to create city...
    return databaseCity.create(city); // return true or false
  }
}
```

* **@graphQlNext**: Can be used to validate a GraphQL query or mutation, like express next function. This will be called before the query/mutation and if doesn't call the next() the query/mutation not will be triggered.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  function(request, response, next): void |  Expects a function as argument to be called, inside the function you'll have the request, response and next arguments. If validation fail, just don't call next() then the query/mutation not will be triggered.

```
function validateUserRole(req, res, next) {
  const user = req.token.user; // mock: get user token example of the request
  if (user === 'admin') {
    next(); // call the query, otherwise return null
  }
}

export class ResolverNextExample {
  @graphQlNext(validateUserRole)
  @graphQlQuery({
    return: [City]
  })
  async getAllCitiesByState(state: State) {
    const databaseCity: any = {}; // database call to create city...
    return databaseCity.getAllCitiesByState(state.id); // will return an array of City[]
  }
}
```


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
  public initial: string = null;
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
