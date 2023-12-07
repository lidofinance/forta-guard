# Forta-guard

Forta-Guard serves a singular purpose—to conceal secrets from public alert bots. So, we have
monorepo https://github.com/lidofinance/alerting-forta where each agent or bot fetches data from nodes are provided by
Forta network.
However, for certain networks like Base, Mantle, ZkSync, and others, Forta does not provide an RPC URLs.
On the flip side, we can leverage private nodes using credentials such as Infura, Alchemy, or DRPC, necessitating the
coverage of these endpoints.

Well, Forta-guard ships only one endpoint (```/secret/<secretKey>```) and safeguarded by FORTA-JWT Authentication.
That is - Forta agents or Forta bots acquire the FORTA-JWT, and then pull from Forta-Guard secret JSON RPC URL protected
by that token.

`http://127.0.0.1/secret/<secretKey>`

### Example

```
## request
curl --request GET \
--url http://127.0.0.1/secret/mantleUrl \
--header 'Authorization: Bearer eyJhbG...R5cCI6IkpXVCJ9.eyJib3QtaWQiO...7SP0' \
--header 'Content-Type: text/plain'

## response
https://mantle.publicnode.com
```

### Running the app

1. cp example.env to .env
2. yarn install
3. yarn build
4. yarn start

#### watch mode

```$ yarn dev```

#### Docker mode for development agents

1. cp example.env to .env
2. Fill everything what you need
3. ```docker-compose up -d```

#### production mode

```$ node dist/main```