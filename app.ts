type Store = {
  currentPage: number;
  feeds: NewsFeed[];
}

// intersection by 타입 알리아스 
type News = {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;
}

type NewsFeed = News & {
  // id: number;
  comments_count: number;
  // url: string;
  // user: string;
  // time_ago: string;
  points: number;
  // title: string;
  read?: boolean;
}

type NewsDetail = News & {
  // id: number;
  // time_ago: string;
  // title: string;
  // url: string;
  // user: string;
  // content: string;
  comments: NewsComment[];
}

type NewsComment = News & {
  // id: number;
  // user: string;
  // time_ago: string;
  // content: string;
  comments: NewsComment[];
  level: number;
}

// 타입 값 명시
const ajax: XMLHttpRequest = new XMLHttpRequest();
const container: HTMLElement | null = document.getElementById('root');
// newsFeed
const NEWS_URL = 'http://api.hnpwa.com/v0/news/1.json'
// newsContent
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
// title이 표현되는 부분
// 공유 값/
const store: Store = {
  currentPage: 1,
  feeds: []
};


// 데이터 

// 열기
// ajax.open('GET', NEWS_URL , false);
// 불러오기
// ajax.send();
// 처리
// const newsFeed = JSON.parse(ajax.response);
// 중복코드 -> 함수안에 넣기
// 리턴값 NewsFeed[] | NewsDetail -> 제네릭 기법 <> 

// class
// 공통 요소: api 불러오기
class Api {
  // api 호출 시 필요한 것들: url, XMLHttpRequest 인스턴스 만드는 코드
  url: string;
  ajax: XMLHttpRequest; // 2. 내부에 저장
  // 생성자: 초기화 과정
  constructor(url: string) { // 1. 외부에서 불러오기
    this.url = url; // 3. 초기화 과정 / this: 인스턴스 객체에 접근하는 지시어
    this.ajax = new XMLHttpRequest();
  }
  // 공통요소 
  protected getRequest<AjaxResponse>(): AjaxResponse {
    this.ajax.open('GET', this.url, false); // this.url에 저장해놨기 때문에 필요x
    this.ajax.send();

    return JSON.parse(this.ajax.response);
  }
} 

// 확장 extends
class NewsFeedApi extends Api {
  getData(): NewsFeed[] { // 데이터를 갖고옴
    // Request 호출해서 값만 얻어오기
    return this.getRequest<NewsFeed[]>(); // 상위 메서드나 특성은 인스턴스 객체로 접근 가능
  }
}

class NewsDetailApi extends Api {
  getData(): NewsDetail { 
    return this.getRequest<NewsDetail>();
  }
}


// 읽었는지 안 읽었는지 저장 함수
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++){
    feeds[i].read = false;
  }

  return feeds;
}

// updateView 함수
function updateView(html: string): void {
  if(container != null){
    container.innerHTML = html;
  } else{
  console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
  }
}
// 목록 함수
// li a 
// DOM div 사용해 innerHTML 시켜 마크업 구조를 선명하게 드러냄
// ul에 fistElementChild시켜 자식으로 포함시킴 
// 목록 화면 함수로 묶기
// const ul = document.createElement('ul');
function newsFeed(): void {
  const api = new NewsFeedApi(NEWS_URL); // class 인스턴스 / 가독성 좋음 -> 어떤 api 사용할 것인지 한눈에 볼수있음
  let newsFeed: NewsFeed[] = store.feeds;
  // 배열 
  const newsList = [];
  // template
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
  `;

  // 최초로 한번 데이터 불러오기 
  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(api.getData()); // class 사용함으로써 사용하는 곳이 깔끔
  }

  // newsList.push('<ul>');
  for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    // const div = document.createElement('div');
    newsList.push(`
      <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
          </div>
        </div>

        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>
    `); 
    // ul.appendChild(div.firstElementChild);
  }

  // newsList.push('</ul>');
  // newsList.push(`
  //     <div>
  //         <a href = "#/page/${store.currentPage > 1 ? store.currentPage - 1 : 1}">이전 페이지</a>
  //         <a href = "#/page/${store.currentPage + 1}">다음 페이지</a>
  //     </div>
  //     `);
  // container.appendChild(ul);
  // container.appendChild(content); // 다른 창
  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
  template = template.replace('{{__next_page__}}', String(store.currentPage + 1));

  updateView(template);
}

// 내용 함수
// 이벤트 - hashchange
// 내용 화면 함수 빼내기
function newsDetail(): void {
  const api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
  // class 
  // console.log('해시가 변경됨'); -> 고유의 값(id)를 #에 추가해줌
  // 데이터 열기, 불러오기, 처리
  // @제외, #제외 
  const id = location.hash.substr(7);
  // ajax.open('GET', CONTENT_URL.replace('@id', id), false);
  // ajax.send();
  // const newsContent = JSON.parse(ajax.response);
  //
  const newsContent = api.getData();
  // h1으로 표현
  // const title = document.createElement('h1');
  // content.appendChild(title);
  // title.innerHTML = newsContent.title;
  // 문자열
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/${store.currentPage}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>${newsContent.title}</h2>
          <div class="text-gray-400 h-20">
            ${newsContent.content}
          </div>

          {{__comments__}}

        </div>
      </div>
  `;

  // 글 읽은 함수
  for(let i = 0; i < store.feeds.length; i++){
    if(store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));
}

function makeComment(comments: NewsComment[]): string {
  const commentString = [];

  for(let i = 0; i < comments.length; i++) {
    const comment: NewsComment = comments[i];

    commentString.push(`
      <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${comment.user}</strong> ${comment.time_ago}
        </div>

        <p class="text-gray-700">${comment.content}</p>
      </div>
    `);

    if(comments[i].comments.length > 0) {
      commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join('');
}

  // 라우터 
function router(): void {
  const routePath = location.hash;

  if(routePath ===''){
    newsFeed(); // 목록 호출
  }else if(routePath.indexOf('#/page/') >= 0){
    store.currentPage = Number(routePath.substr(7));
    newsFeed(); // 페이징, 목록 호출
  }else {
    newsDetail(); // 내용 호출
  }
}

window.addEventListener('hashchange', router);

router();