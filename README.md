# rust-life
Game of Life with web assembly and a few options

# How to run
Follow this [book](https://rustwasm.github.io/book/introduction.html) to setup wasm-pack.
Inside project
```
$ wasm-pack build
```

Inside www
```
$ yarn install
$ yarn start
```

# Interface
- First text field: when life born. String that contain variants, separeted by nothing. That is '23' means 2 or 3.
- Second text field: when life survives. String that contain variants, separeted by nothing. That is '34' means 3 or 4.
- Other two field: width and height.

# TODO
- [ ] There is some bugs when you change to much settigns and restart life.
- [ ] Other toggles and FPS counter apperantly broken.
