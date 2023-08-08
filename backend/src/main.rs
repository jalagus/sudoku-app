#[macro_use] extern crate rocket;
use rocket::serde::{Serialize, Deserialize, json::Json};
use rocket::http::Header;
use rocket::{Request, Response};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::serde::json::{json, Value};

mod sudoku;

use crate::sudoku::Solvable;

#[derive(Debug)]
#[derive(Deserialize)]
#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
struct SudokuJson {
    data: [[u32; 9]; 9]
}

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new("Access-Control-Allow-Methods", "POST, GET, PATCH, OPTIONS"));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

#[options("/<_..>")]
fn all_options() {
    /* Intentionally left empty */
}

#[post("/solve", data="<data>")]
fn solve(data: Json<SudokuJson>) -> Value {
    let sudoku = sudoku::Sudoku9x9 {
        items: data.data
    };
    let solution = sudoku.solve();
    match solution {
        Some(x) => {
            let arr = x.items;
            json!({
                "status": "success",
                "solution": arr
            })
        },
        None => {
            json!({
                "status": "error",
            })
        }
    }

}

#[post("/check", data="<data>")]
fn check(data: Json<SudokuJson>) -> Value {
    let sudoku = sudoku::Sudoku9x9 {
        items: data.data
    };
    let solution_count = sudoku.count_solutions();
    json!({
        "status": "success",
        "solutions": solution_count
    })
}

#[launch]
fn rocket() -> _ {
    rocket::build().attach(CORS).mount("/", routes![all_options, solve, check])
}