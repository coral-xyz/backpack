use argon2::{self, Config};
use rand::Rng;
use serde::*;
use worker::*;

mod utils;

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    #[derive(Deserialize, Serialize)]
    struct HashPayload {
        password: String,
    }
    #[derive(Deserialize, Serialize)]
    struct VerifyPayload {
        // TODO: fetch password_hash from db instead
        hash: String,
        password: String,
    }

    utils::set_panic_hook();

    let router = Router::new();

    router
        .get("/", |_, _| Response::ok("Ahh I'm hashing!"))
        .post_async("/hash", |mut req, ctx| async move {
            let j = req.json::<HashPayload>().await?;
            let password = format!("{}:{}", j.password, ctx.var("PASSPHRASE")?.to_string());
            let salt = rand::thread_rng().gen::<[u8; 32]>();
            let config = Config::default();
            match argon2::hash_encoded(password.as_bytes(), &salt, &config) {
                Ok(hash) => Response::ok(hash),
                Err(_error) => Response::error("An error occurred", 500),
            }
        })
        .post_async("/verify", |mut req, ctx| async move {
            let j = req.json::<VerifyPayload>().await?;
            let password = format!("{}:{}", j.password, ctx.var("PASSPHRASE")?.to_string());
            match argon2::verify_encoded(&j.hash, password.as_bytes()) {
                Ok(value) => Response::ok(value.to_string()),
                Err(_error) => Response::error("An error occurred", 500),
            }
        })
        .run(req, env)
        .await
}
