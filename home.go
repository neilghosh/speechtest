package hello

import (
	"time"
	"net/http"
	"html/template"
	"golang.org/x/net/context"
	"google.golang.org/appengine"
	"google.golang.org/appengine/user"
	"google.golang.org/appengine/datastore"
	"google.golang.org/appengine/log"
	"strconv"
	"fmt"
	"encoding/json"
	"os"
	"bufio"
)

type UserSession struct {
	UserName  string
	EntryTime time.Time
}

type ScoreEntry struct {
	EntryTime time.Time
	Score     float64
}

type UserScores  struct {
	UserName string
	Scores   []ScoreEntry
}

type Data struct {
	SampleTexts map[string]string
	User        string
	IsSightedIn bool
	SignInUrl   string
}

func init() {
	http.HandleFunc("/", handler)
	http.HandleFunc("/savescore", saveScore)
}

func handler(w http.ResponseWriter, r *http.Request) {
	//fmt.Fprint(w, "Hello, world!")
	ctx := appengine.NewContext(r)

	u := user.Current(ctx)

	var in bool
	var UserName string
	var url string

	if u == nil {
		url, _ = user.LoginURL(ctx, "/")
		in = false
	} else {
		url, _ = user.LogoutURL(ctx, "/")
		in = true
		UserName = u.String()
		logSignIn(ctx, UserName)
	}

	textLines, _ := readLines("test_texts.txt");

	texts := make(map[string]string)
	for i := range textLines {
		if((i+1)%3 == 0) {
			texts[textLines[i-2]] = textLines[i-1]
			log.Infof(ctx, "%s - %s\n--------------\n", textLines[i-2],textLines[i-1])

		}
	}

	log.Infof(ctx, "# of line read %d", len(texts))

	data := &Data{
		SampleTexts: texts,
		IsSightedIn: in,
		SignInUrl: url,
		User : UserName,
	}

	w.Header().Set("Content-Type", "text/html")
	t := template.Must(template.New("index_template.html").ParseFiles("index_template.html"))
	t.ExecuteTemplate(w, "index_template.html", data)  // merge.


}

func logSignIn(ctx context.Context, userName string) {
	// ...
	userSession := &UserSession{
		UserName: userName,
		EntryTime:  time.Now(),
	}
	//employee.AttendedHRTraining = true

	key := datastore.NewIncompleteKey(ctx, "UserSession", nil)
	if _, err := datastore.Put(ctx, key, userSession); err != nil {
		// Handle err
	}
	// ...
}

func saveScore(w http.ResponseWriter, r *http.Request) {
	ctx := appengine.NewContext(r)
	w.Header().Set("Content-Type", "application/json")
	log.Infof(ctx, "Request")
	user := user.Current(ctx)
	if user != nil {
		entity := new(UserScores)
		key := datastore.NewKey(ctx, "UserScores", user.String(), 0, nil)
		datastore.Get(ctx, key, entity)

		if r.Method == "POST" {

			keys, ok := r.URL.Query()["score"]
			if !ok || len(keys) < 1 {
				return
			}

			scoreParam := keys[0]

			log.Infof(ctx, "Saving score" + user.String() + " - " + scoreParam)
			score, err := strconv.ParseFloat(scoreParam, 64)
			if err != nil {
				// handle error
				fmt.Println(err)
			}
			scores := entity.Scores
			scores = append(scores, ScoreEntry{
				Score: score,
				EntryTime:  time.Now(),
			})
			if len(scores) > 10 {
				scores = scores[len(scores) - 10:]
			}
			entity.Scores = scores;
			entity.UserName = user.String()
			datastore.Put(ctx, key, entity)

		}
		json.NewEncoder(w).Encode(entity)
		jData, _ := json.Marshal(entity)
		log.Infof(ctx, "Response %s", jData)

	} else {
		log.Infof(ctx, "User not logged in")
	}
}

func readLines(path string) ([]string, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	return lines, scanner.Err()
}