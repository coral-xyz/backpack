use argon2::{self, Config};
use rand::Rng;
use reqwest::{Client, RequestBuilder};
use serde::*;
use worker::*;

mod utils;

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    utils::set_panic_hook();

    let router = Router::new();

    router
        .get("/", |_, _| Response::ok("ok"))
        .post_async("/signup", |mut req, ctx| async move {
            #[derive(Deserialize)]
            struct SignupPayload {
                username: String,
                password: String,
                invite_code: String,
            }

            let data: SignupPayload = match req.json().await {
                Ok(res) => res,
                Err(_) => return Response::error("Bad request", 400),
            };

            let password = format!("{}:{}", data.password, ctx.var("PASSPHRASE")?.to_string());
            let salt = rand::thread_rng().gen::<[u8; 32]>();
            let config = Config::default();
            let password_hash = argon2::hash_encoded(password.as_bytes(), &salt, &config).unwrap();

            let client = Client::new()
                .post(ctx.var("GRAPHQL_URL")?.to_string())
                .header(
                    "x-hasura-admin-secret",
                    ctx.var("HASURA_SECRET")?.to_string(),
                );

            match signup(&data.username, &password_hash, &data.invite_code, client).await {
                Some(_) => Response::ok("user created"),
                None => Response::error("Error creating user", 400),
            }
        })
        .post_async("/signin", |mut req, ctx| async move {
            #[derive(Deserialize)]
            struct SigninPayload {
                username: String,
                password: String,
            }

            let data: SigninPayload = match req.json().await {
                Ok(res) => res,
                Err(_) => return Response::error("Bad request", 400),
            };

            let client = Client::new()
                .post(ctx.var("GRAPHQL_URL")?.to_string())
                .header(
                    "x-hasura-admin-secret",
                    ctx.var("HASURA_SECRET")?.to_string(),
                );

            match get_user_by_username(&data.username, client).await {
                Some(value) => {
                    let password =
                        format!("{}:{}", data.password, ctx.var("PASSPHRASE")?.to_string());
                    match argon2::verify_encoded(
                        &value.data.auth_users[0].password_hash,
                        password.as_bytes(),
                    ) {
                        Ok(true) => Response::ok("ok"), // TODO: return JWT
                        Ok(false) => Response::error("Invalid password", 400),
                        Err(_) => Response::error("Error verifying password", 400),
                    }
                }
                None => Response::error("User not found", 404),
            }
        })
        .post_async("/check-invite-code", |mut req, ctx| async move {
            #[derive(Deserialize)]
            struct InviteCodePayload {
                code: String,
            }

            let data: InviteCodePayload = match req.json().await {
                Ok(res) => res,
                Err(_) => return Response::error("Bad request", 400),
            };

            let client = Client::new()
                .post(ctx.var("GRAPHQL_URL")?.to_string())
                .header(
                    "x-hasura-admin-secret",
                    ctx.var("HASURA_SECRET")?.to_string(),
                );

            match check_if_invite_code_is_available(&data.code, client).await {
                Some(value) => match value.data.invitations.first() {
                    Some(invitation) => match invitation.claimed_at {
                        serde_json::Value::Null => Response::ok("ok"),
                        _ => Response::error("Invite code already claimed", 400),
                    },
                    None => Response::error("Invite code not found", 404),
                },
                None => Response::error("Error verifying, code is possibly invalid", 400),
            }
        })
        .run(req, env)
        .await
}

// signup
#[derive(Deserialize)]
pub struct SignupGraphqlResponse {
    pub data: SignupData,
}
#[derive(Deserialize)]
pub struct SignupData {
    pub insert_auth_users_one: InsertAuthUsersOne,
}
#[derive(Deserialize)]
pub struct InsertAuthUsersOne {
    pub id: String,
}
async fn signup(
    username: &str,
    password_hash: &str,
    invite_code: &str,
    client: RequestBuilder,
) -> Option<SignupGraphqlResponse> {
    let body = serde_json::json!({
        "query": "mutation ($password_hash: String!, $username: String!, $invitation_id: uuid!) {
            insert_auth_users_one(object: {
                password_hash: $password_hash, username: $username, invitation_id: $invitation_id
            }) {
              id
            }
          }",
        "variables": {
            "username": username,
            "password_hash": password_hash,
            "invitation_id": invite_code,
        }
    });

    let response = match client.json(&body).send().await {
        Ok(res) => res,
        Err(_) => return None,
    };

    match response.json().await {
        Ok(res) => Some(res),
        Err(_) => None,
    }
}

// username
#[derive(Deserialize)]
pub struct UsernameResponse {
    pub data: UsernameData,
}
#[derive(Deserialize)]
pub struct UsernameData {
    pub auth_users: Vec<AuthUser>,
}
#[derive(Deserialize)]
pub struct AuthUser {
    pub password_hash: String,
}
async fn get_user_by_username(username: &str, client: RequestBuilder) -> Option<UsernameResponse> {
    let body = serde_json::json!({
        "query": "query ($username: String!) {
            auth_users(limit: 1, where: {username: {_eq: $username}}) {
              password_hash
            }
          }",
        "variables": {
            "username": username,
        },
    });

    let response = match client.json(&body).send().await {
        Ok(res) => res,
        Err(_) => return None,
    };
    match response.json().await {
        Ok(res) => Some(res),
        Err(_) => None,
    }
}

// invitation
#[derive(Deserialize)]
struct InviteCodeGraphqlResponse {
    pub data: InviteCodeData,
}
#[derive(Deserialize)]
pub struct InviteCodeData {
    pub invitations: Vec<Invitation>,
}
#[derive(Deserialize)]
pub struct Invitation {
    pub claimed_at: serde_json::Value,
}
async fn check_if_invite_code_is_available(
    code: &str,
    client: RequestBuilder,
) -> Option<InviteCodeGraphqlResponse> {
    let body = serde_json::json!({
        "query": "query ($id: uuid!) {
            invitations(where: {id: {_eq: $id}}, limit: 1) {
                claimed_at
            }
        }",
        "variables": {
            "id": code,
        },
    });
    let response = match client.json(&body).send().await {
        Ok(res) => res,
        Err(_) => return None,
    };
    match response.json().await {
        Ok(res) => Some(res),
        Err(_) => None,
    }
}
