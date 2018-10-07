package main

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	"github.com/go-martini/martini"
	"github.com/jinzhu/gorm"                   // ORM package for Go
	_ "github.com/jinzhu/gorm/dialects/sqlite" // for SQLite. Only imports functions so that ORM can use. Hence the '_'
	"github.com/martini-contrib/binding"
	"github.com/martini-contrib/cors"
	"github.com/martini-contrib/render"
	"github.com/martini-contrib/sessionauth"
	"github.com/martini-contrib/sessions"
	_ "github.com/mattn/go-sqlite3"
)

var db *gorm.DB

func GetMD5Hash(text string) string {
	hasher := md5.New()
	hasher.Write([]byte(text))
	return hex.EncodeToString(hasher.Sum(nil))
}

// Base Model's definition
type Model struct {
	ID        uint `gorm:"primary_key" gorm:"AUTO_INCREMENT"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type User struct {
	gorm.Model
	Username string `form:"username" binding:"required"`
	Password string `form:"password" binding:"required"`
	Role     string `form:"role"`
	LoggedIn bool
}

func (u *User) IsAuthenticated() bool {
	return u.LoggedIn
}

func (u *User) Login() {
	u.LoggedIn = true
}

func (u *User) Logout() {
	u.LoggedIn = false
}

func (u *User) UniqueId() interface{} {
	return u.ID
}

func (u *User) GetById(id interface{}) error {
	err := db.First(&u, id).Error
	if err != nil {
		return err
	}
	return nil
}

func NewUser() sessionauth.User {
	user := &User{}
	user.Role = "None"
	user.LoggedIn = false
	return &User{}
}

func Login(session sessions.Session, postedUser User, r render.Render) {
	user := User{}
	err := db.Where("username = ?", postedUser.Username).First(&user).Error
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Username not Found"})
	} else {
		if user.Password != GetMD5Hash(postedUser.Password) {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Password doesn't match"})
			return
		}
		err := sessionauth.AuthenticateSession(session, &user) //Validates the cookie with the user
		if err != nil {
			r.JSON(500, map[string]interface{}{"status": "FAILURE", "message": "Authentication Failiure"})
			return
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Successfully Authenticated"})
	}
	return
}

func Register(postedUser User, r render.Render) {
	postedUser.CreatedAt = time.Now()
	postedUser.UpdatedAt = time.Now()
	postedUser.Password = GetMD5Hash(postedUser.Password)
	test := &User{}
	testErr := db.Where("username = ?", postedUser.Username).First(&test).Error
	if testErr == nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Username already exists"})
		return
	}
	err := db.Create(&postedUser).Error
	if err != nil {
		r.JSON(500, map[string]interface{}{"status": "FAILURE", "message": "Unable to create User"})
	}
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "User succesfully registered"})
}

type Genre struct {
	ID      uint   `form:"id"`
	Name    string `form:"name"`
	Quizzes []Quiz
}

type Quiz struct {
	ID        uint   `form:"id"`
	Title     string `form:"title" binding:"required"`
	GenreID   uint   `form:"genre" sql:"type:bigint REFERENCES genres(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	Questions []Question
}

type Question struct {
	ID        uint   `form:"id" binding:"required"`
	QuizID    uint   `form:"quiz" sql:"type:bigint REFERENCES quizzes(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	Statement string `form:"statement" binding:"required"`
	Bonus     string `form:"bonus"`
	Points    string `form:"points" binding:"required"`
	Type      string `form:"type" binding:"required"`
	MediaType string `form:"mediatype"`
	MediaURL  string `form:"mediaurl"`
	Options   []Option
}

type Option struct {
	ID         uint   `form:"id" binding:"required"`
	QuestionID uint   `form:"question" sql:"type:bigint REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	Statement  string `form:"statement" binding:"required"`
	Validity   string `form:"validity" binding:"required"`
}

type Game struct {
	ID      uint
	QuizID  uint `form:"quiz" sql:"type:bigint REFERENCES quizzes(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	GenreID uint `form:"genre" sql:"type:bigint REFERENCES genres(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	UserID  uint `sql:"type:bigint REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE";`
	Points  uint `form:"points"`
}

func DeleteGenre(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	user := &User{}
	db.First(&user, postedUser.UniqueId())
	if user.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
		return
	}
	genre := Genre{}
	err2 := db.First(&genre, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	db.Delete(&genre)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Genre Deleted Successfully"})
}

func DeleteQuiz(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	user := &User{}
	db.First(&user, postedUser.UniqueId())
	if user.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Quiz ID"})
		return
	}
	quiz := Quiz{}
	err2 := db.First(&quiz, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	db.Delete(&quiz)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz Deleted Successfully"})
}

func DeleteQuestion(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	user := &User{}
	db.First(&user, postedUser.UniqueId())
	if user.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Question ID"})
		return
	}
	question := Question{}
	err2 := db.First(&question, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	db.Delete(&question)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Question Deleted Successfully"})
}

func ListQuestion(params martini.Params, r render.Render) {
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Quiz ID"})
		return
	}
	quiz := Quiz{}
	err2 := db.First(&quiz, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	var questions []Question
	err3 := db.Model(&quiz).Related(&questions).Error
	if err3 != nil {
		fmt.Println(err3)
	}
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quizzes fetched successfully", "quiz": quiz.Title, "questions": questions})
}

func ListOption(params martini.Params, r render.Render) {
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Question ID"})
		return
	}
	question := Question{}
	err2 := db.First(&question, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	var options []Option
	err3 := db.Model(&question).Related(&options).Error
	if err3 != nil {
		fmt.Println(err3)
	}
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Options fetched successfully", "question": question.Statement, "options": options})
}

func DeleteOption(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	user := &User{}
	db.First(&user, postedUser.UniqueId())
	if user.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Option ID"})
		return
	}
	option := Option{}
	err2 := db.First(&option, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	db.Delete(&option)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Option Deleted Successfully"})
}

func Play(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Quiz ID"})
		return
	}
	quiz := Quiz{}
	err2 := db.First(&quiz, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	err3 := db.Model(&quiz).Related(&(quiz.Questions)).Error
	if err3 != nil {
		fmt.Println(err3)
	}
	for i := range quiz.Questions {
		err4 := db.Model(&(quiz.Questions[i])).Related(&(quiz.Questions[i].Options)).Error
		if err4 != nil {
			fmt.Println(err4)
		}
	}
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz fetched successfully", "quiz": quiz})
}

func Submit(game Game, session sessions.Session, user sessionauth.User, r render.Render) {
	game.UserID = user.UniqueId().(uint)
	err := db.Create(&game).Error
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Error occured during submission"})
		return
	}
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Game submitted successfully"})
}

func DeleteUser(params martini.Params, session sessions.Session, postedUser sessionauth.User, r render.Render) {
	test := &User{}
	db.First(&test, postedUser.UniqueId())
	if test.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Option ID"})
		return
	}
	user := User{}
	err2 := db.First(&user, id).Error
	if err2 != nil {
		fmt.Println(err2)
	}
	db.Delete(&user)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "User Deleted Successfully"})
}

func OverallLeaderboard(r render.Render) {
	type Result struct {
		Username string
		Total    uint
	}
	var result []Result
	db.Raw("SELECT users.username, SUM(games.points) as total FROM users, games WHERE games.user_id = users.id GROUP BY games.user_id ORDER BY total desc;").Scan(&result)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Leaderboard generated successfully", "board": result})
}

func Leaderboard(params martini.Params, r render.Render) {
	type Result struct {
		Username string
		Total    uint
	}
	var result []Result
	fmt.Println(params["id"])
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
		return
	}
	genre := Genre{}
	err2 := db.First(&genre, id).Error
	if err2 != nil {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
		return
	}
	db.Raw("SELECT users.username, SUM(games.points) as total FROM users, games WHERE games.user_id = users.id AND games.genre_id = ? GROUP BY games.user_id ORDER BY total desc", id).Scan(&result)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Leaderboard generated successfully", "board": result, "genre": genre.Name})
}

func GetHistory(session sessions.Session, user sessionauth.User, r render.Render) {
	type History struct {
		Quiz  string
		Genre string
		Score uint
	}
	var history []History
	db.Raw("SELECT quizzes.title as quiz, genres.name as genre, games.points as score FROM quizzes, genres, games WHERE quizzes.id = games.quiz_id AND genres.id = games.genre_id AND games.user_id = ? ORDER BY games.id desc", user.UniqueId()).Scan(&history)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "History retrieved successfully", "history": history})
}

func GetUsers(session sessions.Session, user sessionauth.User, r render.Render) {
	test := &User{}
	db.First(&test, user.UniqueId())
	if test.Role != "admin" {
		r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Insufficient Privileges"})
		return
	}
	var users []User
	db.Find(&users)
	r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Successfully fetched all users", "users": users})
}

func main() {
	store := sessions.NewCookieStore([]byte("SecretPassKey")) //Temporary Storage for cookies in this session
	var err error
	db, err = gorm.Open("sqlite3", "./App.db")
	if err != nil {
		fmt.Println("Unable to read DB")
		return
	}
	defer db.Close()
	db.AutoMigrate(&User{}, &Genre{}, &Quiz{}, &Question{}, &Option{}, &Game{})
	db.LogMode(true)
	db.Exec("PRAGMA foreign_keys = ON")
	// SQLite3 doesn't support ForeignKeys in Alter Table
	// db.Model(&Quiz{}).AddForeignKey("genre_id", "genres(id)", "CASCADE", "CASCADE")
	// db.Model(&Question{}).AddForeignKey("quiz_id", "quizs(id)", "CASCADE", "CASCADE")
	// db.Model(&Option{}).AddForeignKey("question_id", "questions(id)", "CASCADE", "CASCADE")
	m := martini.Classic()
	m.Use(cors.Allow(&cors.Options{
		AllowCredentials: true,
		AllowOrigins:     []string{"http://localhost:3001"},
		AllowMethods:     []string{"POST", "GET"},
	}))
	// Default our store to use Session cookies, so we don't leave logged in users roaming around
	store.Options(sessions.Options{
		MaxAge: 0,
	})
	m.Use(render.Renderer(render.Options{
		IndentJSON: true, //For testing API
	}))
	m.Use(sessions.Sessions("quiz_session", store))
	m.Use(sessionauth.SessionUser(NewUser)) //Cookies for everyone
	sessionauth.RedirectUrl = "/login"
	sessionauth.RedirectParam = "from" //From where is the user redirected ?
	m.Get("/", func(r render.Render) {
		r.JSON(200, map[string]interface{}{"hello": "world"})
	})
	m.Post("/login", binding.Bind(User{}), Login)
	m.Post("/register", binding.Bind(User{}), Register)
	m.Get("/check", func(session sessions.Session, postedUser sessionauth.User, r render.Render) {
		if postedUser.IsAuthenticated() {
			user := &User{}
			fmt.Println(postedUser.UniqueId())
			db.First(&user, postedUser.UniqueId())
			fmt.Println(user.Role)
			if user.Role == "admin" {
				r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Logged In", "role": "Admin"})
			} else {
				r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Logged In", "role": "User"})
			}
		} else {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Logged Out", "role": "None"})
		}

	})
	m.Get("/logout", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r render.Render) {
		sessionauth.Logout(session, user)
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Logged Out Successfully"})
	})
	m.Get("/add_genre", sessionauth.LoginRequired, func(session sessions.Session, user sessionauth.User, r render.Render) {
		newGenre := Genre{}
		newGenre.Name = "Exciting New Genre"
		err := db.Create(&newGenre).Error
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Create Genre"})
			return
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Genre Added Successfully", "ID": newGenre.ID})
	})
	m.Get("/get_genre/:id", sessionauth.LoginRequired, func(params martini.Params, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
			return
		}
		genre := Genre{}
		err2 := db.First(&genre, id).Error
		if err2 != nil {
			fmt.Println(err2)
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Genre Name Fetched Successfully", "name": genre.Name})
	})
	m.Post("/edit_genre", sessionauth.LoginRequired, binding.Bind(Genre{}), func(postedGenre Genre, session sessions.Session, user sessionauth.User, r render.Render) {
		genre := Genre{}
		err := db.First(&genre, postedGenre.ID).Error
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Edit Genre"})
			return
		}
		genre.Name = postedGenre.Name
		db.Save(&genre)
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Genre Edited Successfully"})
	})
	m.Get("/add_quiz/:id", sessionauth.LoginRequired, func(params martini.Params, session sessions.Session, user sessionauth.User, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
			return
		}
		quiz := Quiz{}
		quiz.Title = "A Challenge"
		quiz.GenreID = uint(id)
		err2 := db.Create(&quiz).Error
		if err2 != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Create Quiz"})
			return
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz Added Successfully", "id": quiz.ID})
	})
	m.Get("/get_quiz/:id", sessionauth.LoginRequired, func(params martini.Params, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Quiz ID"})
			return
		}
		quiz := Quiz{}
		err2 := db.First(&quiz, id).Error
		if err2 != nil {
			fmt.Println(err2)
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz Name Fetched Successfully", "title": quiz.Title, "genre": quiz.GenreID})
	})
	m.Post("/edit_quiz", sessionauth.LoginRequired, binding.Bind(Quiz{}), func(postedQuiz Quiz, session sessions.Session, user sessionauth.User, r render.Render) {
		quiz := Quiz{}
		err := db.First(&quiz, postedQuiz.ID).Error
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Edit Genre"})
			return
		}
		quiz.Title = postedQuiz.Title
		db.Save(&quiz)
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz Edited Successfully"})
	})
	m.Get("/add_question/:id", sessionauth.LoginRequired, func(params martini.Params, session sessions.Session, user sessionauth.User, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Quiz ID"})
			return
		}
		question := Question{}
		question.Statement = "?"
		question.QuizID = uint(id)
		question.Type = "radio"
		question.MediaType = ""
		question.MediaURL = ""
		err2 := db.Create(&question).Error
		if err2 != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Create Question"})
			return
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Question Added Successfully", "id": question.ID})
	})
	m.Get("/get_question/:id", sessionauth.LoginRequired, func(params martini.Params, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Question ID"})
			return
		}
		question := Question{}
		err2 := db.First(&question, id).Error
		if err2 != nil {
			fmt.Println(err2)
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Question Name Fetched Successfully", "statement": question.Statement, "points": question.Points, "bonus": question.Bonus, "quiz": question.QuizID, "type": question.Type, "mediatype": question.MediaType, "mediaurl": question.MediaURL})
	})
	m.Post("/edit_question", sessionauth.LoginRequired, binding.Bind(Question{}), func(postedQuestion Question, session sessions.Session, user sessionauth.User, r render.Render) {
		question := Question{}
		err := db.First(&question, postedQuestion.ID).Error
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Edit Question"})
			return
		}
		question.Statement = postedQuestion.Statement
		question.Points = postedQuestion.Points
		question.Bonus = postedQuestion.Bonus
		question.Type = postedQuestion.Type
		question.MediaType = postedQuestion.MediaType
		question.MediaURL = postedQuestion.MediaURL
		db.Save(&question)
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quiz Edited Successfully"})
	})
	m.Get("/list_genres", sessionauth.LoginRequired, func(r render.Render) {
		var genres []Genre
		err := db.Find(&genres).Error
		if err != nil {
			fmt.Println(err)
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Successfully fetched all genres", "genres": genres})
	})
	m.Get("/list_quiz/:id", sessionauth.LoginRequired, func(params martini.Params, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Genre ID"})
			return
		}
		genre := Genre{}
		err2 := db.First(&genre, id).Error
		if err2 != nil {
			fmt.Println(err2)
		}
		var quizzes []Quiz
		err3 := db.Model(&genre).Related(&quizzes).Error
		if err3 != nil {
			fmt.Println(err3)
		}
		type OutputQuizzes struct {
			status  string
			message string
			quizzes []Quiz
		}
		output := OutputQuizzes{}
		output.status = "SUCCESS"
		output.message = "Quizzes fetched from Database"
		output.quizzes = quizzes
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Quizzes fetched successfully", "genre": genre.Name, "quizzes": quizzes})
	})
	m.Get("/add_option/:id", sessionauth.LoginRequired, func(params martini.Params, session sessions.Session, user sessionauth.User, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Question ID"})
			return
		}
		option := Option{}
		option.Statement = "Value"
		option.Validity = "false"
		option.QuestionID = uint(id)
		err2 := db.Create(&option).Error
		if err2 != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Create Option"})
			return
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Option Added Successfully", "id": option.ID})
	})
	m.Get("/get_option/:id", sessionauth.LoginRequired, func(params martini.Params, r render.Render) {
		id, err := strconv.Atoi(params["id"])
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Invalid Option ID"})
			return
		}
		option := Option{}
		err2 := db.First(&option, id).Error
		if err2 != nil {
			fmt.Println(err2)
		}
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Option Fetched Successfully", "statement": option.Statement, "validity": option.Validity, "question": option.QuestionID})
	})
	m.Post("/edit_option", sessionauth.LoginRequired, binding.Bind(Option{}), func(postedOption Option, session sessions.Session, user sessionauth.User, r render.Render) {
		option := Option{}
		err := db.First(&option, postedOption.ID).Error
		if err != nil {
			r.JSON(200, map[string]interface{}{"status": "FAILURE", "message": "Unable to Edit Option"})
			return
		}
		option.Statement = postedOption.Statement
		option.Validity = postedOption.Validity
		db.Save(&option)
		r.JSON(200, map[string]interface{}{"status": "SUCCESS", "message": "Option Edited Successfully"})
	})
	m.Get("/list_questions/:id", sessionauth.LoginRequired, ListQuestion)
	m.Get("/list_options/:id", sessionauth.LoginRequired, ListOption)
	m.Get("/delete_genre/:id", sessionauth.LoginRequired, DeleteGenre)
	m.Get("/delete_quiz/:id", sessionauth.LoginRequired, DeleteQuiz)
	m.Get("/delete_question/:id", sessionauth.LoginRequired, DeleteQuestion)
	m.Get("/delete_option/:id", sessionauth.LoginRequired, DeleteOption)
	m.Get("/play/:id", sessionauth.LoginRequired, Play)
	m.Post("/submit_game", sessionauth.LoginRequired, binding.Bind(Game{}), Submit)
	m.Get("/leaderboard", OverallLeaderboard)
	m.Get("/genre_leaderboard/:id", Leaderboard)
	m.Get("/history", GetHistory)
	m.Get("/users", sessionauth.LoginRequired, GetUsers)
	m.Get("/delete_user/:id", sessionauth.LoginRequired, DeleteUser)
	m.Run()
}
