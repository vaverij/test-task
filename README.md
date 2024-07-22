# Uzdevums

#### 1) Atrast apollo.ts failu

#### 2) Pievienot komentātrus (ne visur bet tīri paskaidrot ko kas dara, jo vairāk komentāru, jo labāk)

#### 3) Kas trūkst šajā kodā ? (Ieteikumi / uzlabojumi)

    IN RANDOM ORDER
    1.handleError is not called
    2. In handleRequest type validation could be written using less code, "else" is useless (because it validates only query or mutation)
        2.1. type declaration is done using more readable approach
    3. In createClient !! can be removed for better readability (why we need to use "not false" when we can validate as "is true")
    4.handleRequest to use the try-catch block for promises for better error handling
    5. In request() "type Request ..." can be removed, R as a generic to be used instead
    6. Some functions (such as createClient) can be decomposed for a better readabity
    7. loadClient is a tricky one - I'm not sure I like the code, but here's definately something's going on. Probably this is codeed to keep the correct cache and state. IF statement can be written by basically leaving "if(uri)".
        In the final result I left only validation if the globalApolloClient was created. I think using the same client (rather than creating it each time) is better in context of my task
    8. In handleRequest instead of returning undefined I'd throw an error. It' s a better practice.
    9. In CreateClient I commented out the fetch-policy to cache results for a better speed.


    the "good file" will be named as "plugins/apollo.ts" and "utils/apollo-client.ts" - this is only for keeping track of what's changed

#### 4\*) Vai spēj šo kodu padarīt strādājošu ?

- Ieimplementējot to Nuxt aplikācijā, (veicot mazus koriģējumus apollo.ts lai tas strādātu - tipu aizvietošana ar any tiek pieņemta, ja tie nav fiziski pieejami dēļ neesošajiem failiem) un veicot ar to pieprasījumu uz kādu reālu endpointu ar graphql query un atgriežot rezultātus iekš nuxt aplikācijas.

API: https://graphqlzero.almansi.me/api
DOCS: https://graphqlzero.almansi.me/#example-top
