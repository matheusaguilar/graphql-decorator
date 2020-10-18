## GraphQl-Decorator

[GraphQlPage](https://matheusaguilar.github.io/graphql-decorator/)

GraphQl is awesome, but create schemas are boring. In this project I try to do your life easier with the Decorators of Typescript.

To solve this, we need:

* Model class to define how the schema will be.
* Resolver class to create query/mutations.
* A function defined by you that, given a model with an Id, how do you retrive all the data related with this model? 

First of all, we need to know the types that we can use, we have Basic types and Model types.

Basic types: **String, Number** and **Boolean**

Model Types: Are the models that's decorated with **@GraphQlModel()** 

### Models
For models we have the decorators:

**@GraphQlModel**: Defines a model type of graphQL.

**@GraphQlPk**: Defines the attribute that's used to resolve this model.

**@GraphQlColumn**: Defines one attribute of the model.

**@GraphQlFk**: Define a foreign model that will need be resolved.

```javascript
import { GraphQlModel, GraphQlPk, GraphQlFk, GraphQlColumn } from 'graphql-decorator/lib';

@GraphQlModel()
export class State {
  @GraphQlPk()
  public id: number;

  @GraphQlColumn()
  public name: string;

  @GraphQlColumn()
  public initial: string;
}

@GraphQlModel()
export class City {
  @GraphQlPk()
  public id: number;

  @GraphQlColumn()
  public name: string;

  @GraphQlFk(() => State)
  public state: State;
}
```

### Resolvers
Resolvers have decorators for functions of the class:

**@GraphQlQuery**: Create a GraphQL query.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  return |  Define the type of the return of the query. Can be any one of the types: **String, Number, Boolean** or Some Model(**@GraphQlModel**) |
|  name? |  Define the name of the query that will be created, if not provided the query will use the function name. |

```javascript
export class ResolverQueryExample {
  @GraphQlQuery({
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

**@GraphQlMutation**: Create a GraphQL mutation.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  return |  Define the type of the return of the query. Can be any one of the types: **String, Number, Boolean** or Some Model(**@GraphQlModel**) |
|  name? |  Define the name of the mutation that will be created, if not provided the query will use the function name. |

```javascript
export class ResolverMutationExample {
  @GraphQlMutation({
    return: Boolean
  })
  async createCity(city: City) {
    const databaseCity: any = {}; // database call to create city...
    return databaseCity.create(city); // return true or false
  }
}
```

**@GraphQlAuth**: Can be used to validate a GraphQL query or mutation, like express next function. This will be called before the query/mutation and if doesn't call the next() the query/mutation not will be triggered.

| Arguments  |  Description  |
| ------------------- | ------------------- |
|  function(request, response, next): void |  Expects a function as argument to be called, inside the function you'll have the request, response and next arguments. If validation fail, just don't call next() then the query/mutation not will be triggered.

```javascript
function validateUserRole(req, res, next) {
  const user = req.token.user; // get user from token in request example
  if (user === 'admin') {
    next(); // trigger the query
  }
}

export class ResolverNextExample {
  @GraphQlAuth(validateUserRole)
  @GraphQlQuery({
    return: [City]
  })
  async getAllCitiesByState(state: State) {
    const databaseCity: any = {}; // database call to create city...
    return databaseCity.getAllCitiesByState(state.id); // will return an array of City[]
  }
}
```

### How to use Arrays as type
At the moment, typescript don't support in Reflection to get the type of an Array. To bypass this, I defined an Array with the type inside it:
```javascript
@GraphQlQuery({
  return: [Type]
})
```

```javascript
@GraphQlQuery({
  return: [Type]
})
async getExample(@GraphQlParam({ type: [Type] }) example: Type[]) {
  // code ...
  return ;
}
```

### ResContext
When creating a query or mutation maybe you need the request/response of the request, to get that you just need to put some argument with the type ResContext.

```javascript
import { ResContext } from 'graphql-decorator/lib';

@GraphQlQuery({
  return: [Type]
})
async exampleQuery(city: City, state: State, context: ResContext) {
   console.log(context.req);
   console.log(context.res);
   return null;
}
```

### SchemaBuilder
SchemaBuilder will be the class that will be used to register all models, resolvers and to create the schema for you.
On the constructor of this class you need to pass a function that will resolve all models. When graphql need to resolve a model he'll call this function passing the model as argument with the @graphQlPk() attribute filled. A full example will be shown:


```javascript
import * as http from 'http';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { GraphQlModel, GraphQlPk, GraphQlFk, GraphQlColumn, GraphQlQuery } from 'graphql-decorator';

@GraphQlModel()
export class State {
  @GraphQlPk()
  public id: number = null;

  @GraphQlColumn()
  public name: string = null;

  @GraphQlColumn()
  public initial: string = null;
}

@GraphQlModel()
export class City {
  @GraphQlPk()
  public id: number = null;

  @GraphQlColumn()
  public name: string = null;

  @GraphQlFk(() => State)
  public state: State = null;
}

export class ResolverExample {
  @GraphQlQuery({
    return: City
  })
  async getCity(cityId: number) {
    const city = new City();
    city.id = cityId;
    city.name = 'Awesome City';
    city.state = new State();
    city.state.id = 1;
    return city;
  }
}

const app = express();
const httpServer = new http.Server(app);

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

const schemaBuilder = new SchemaBuilder((model: any) => {
  // when call the resolver, City has a fk of State, to resolve the State this function will be called.
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
      context: { // context is really important for this package (Needed)
        req,
        res,
      },
    })(req, res)
  );
});
```
