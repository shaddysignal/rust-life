use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1
}

impl Cell {
    pub fn toggle(&mut self) -> () {
        *self = match *self {
            Cell::Alive => Cell::Dead,
            Cell::Dead => Cell::Alive
        }
    }
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CellFormFactor {
    Triangle = 3,
    Square = 4,
    Hexagon = 6
}

#[wasm_bindgen]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LifeRules {
    born: Vec<u8>,
    survives: Vec<u8>
}

impl LifeRules {
    pub fn new(born: Vec<u8>, survives: Vec<u8>) -> Self {
        LifeRules {
            born: born,
            survives: survives
        }
    }

    pub fn get_born(&self) -> &Vec<u8> { &self.born }
    pub fn get_survives(&self) -> &Vec<u8> { &self.survives }
}

impl std::fmt::Display for LifeRules {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "B{:?}/S{:?}", self.born, self.survives)
    }
}