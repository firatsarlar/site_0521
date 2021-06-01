import { Fragment, h, render } from 'preact';
import Router, { route } from 'preact-router';

function Profile(props) {
  // `props.rest` is the rest of the URL after "/profile/"
  return (
    <div>
      <h1>Rts</h1>
      <nav>
        <a href="/en">Home</a>
        <a href="/en/profile/me">My Profile</a>
        <a href="/en/profile/alice">Alice's Profile</a>
        <a href="/en/profile/alice/detaaa">Alice's Profile</a>
        <a href="/en/profile/alice/detaaa/detb">Alice's Profile</a>
      </nav>
      <nav>
        <a href="/de">Home</a>
        <a href="/de/profile/me">My Profile</a>
        <a href="/de/profile/alice">Alice's Profile</a>
        <a href="/de/profile/alice/detaaa">Alice's Profile</a>
        <a href="/de/profile/alice/detaaa/detb">Alice's Profile</a>
      </nav>
    </div>
  );
}
const MyProfile = (props) => (<h2>My Profile</h2>);
const UserProfile = (_props) => {

  let Pp = []
  let props = _props.matches;
  for (const k in props)
    Pp.push(
      <><span>{k}:{props[k]}</span><br /></>
    )
  console.dir(props);
  window.__ctx.cprops = props;
  return (
    <Fragment>
      <h2>Propsi</h2>
      {Pp}
    </Fragment>
  )
};
const UserProfileX = (props) => (<h2>{props.user}</h2>);
const Home = (props) => (
  <Fragment>
    <h2>Home</h2>
    <Profile />
  </Fragment>

);
const Page404 = (props) => {

  return (
      <div class="p404" >
          404444
  
      </div>

  )
};
function App(props) {
  const handleRoute = async e => {
    window.__ctx.crt = e;
    console.dir(e);

  };

  return (
    <div>
      <Router onChange={handleRoute}>
        <Home path="/" />

        <Profile path=":lang/profile" />
        <MyProfile path=":lang/profile/me" />
        {/* <UserProfile path=":lang/profile/:user" />
        <UserProfile path=":lang/profile/:user/:oo" /> */}
        <UserProfile path=":lang/profile/:user/:oo?/:nn?" />
        <Page404 default/>
      </Router>

    </div>
  );
}

export default App;