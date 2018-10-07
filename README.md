# Usage & Features

App is divided into two parts:

* `yarn start` will start the React JS front-end.
* `go run server.go` will start the Go back-end.

## Packages
For React :
 * `react-router-dom`
 *  `redux`

For Go :
 * `crypto/md5` : Inbuilt
 * `encoding/hex` : Inbuilt
 * `fmt` : Inbuilt
 * `strconv` : Inbuilt
 * `time` : Inbuilt
 * `martini` : Can be found at https://github.com/go-martini/martini
 * `gorm` : Can be found at https://github.com/jinzhu/gorm
 * `binding` : Can be found at https://github.com/martini-contrib/binding
 * `cors` : Can be found at https://github.com/martini-contrib/cors
 * `render` : Can be found at https://github.com/martini-contrib/render
 * `sessionauth` : Can be found at https://github.com/martini-contrib/render
 * `sessions` : Can be found at https://github.com/martini-contrib/sessions
 * `go-sqlite3` : Can be found at https://github.com/mattn/go-sqlite3

## To Use
First, sign up with a username and password and choose a role for yourself, typing `admin` in the role will grant the user admin privileges, anything else will give normal privileges.
Go into the Action tab to list all the genres and select a quiz from the genrewise listing.

### Playing
The Gameplay is simple, there are 2 types of questions, MCQ Single Correct & MCQ Multiple Correct.
For each question, there are different number of points (bonus) and ability to skip the question without choosing an answer (bonus).

### Admin Features
For an admin, following abilities are provided : Edit, Add & Delete Genres, Quizzes, Questions and their Options and also View & Remove Users
