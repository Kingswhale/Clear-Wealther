import Homescreen from "./modules/auth";
import Mainscreen from "./modules/main";
import LoginScreen from "./modules/auth/Login";
import SignupScreen from "./modules/auth/Register";
import Getstarted from './modules/auth/getstarted';
import Membership from './modules/auth/membership';
import ProfileScreen from "./modules/profile/profile";
import EditFeed from "./modules/feed/components/editFeed"
import FeedEditor from "./modules/feed/components/feedEditor"
import SelectFeelings from "./modules/feed/components/selectFeelings";
import SelectFriends from "./modules/user/selectFriend";
import AlbumPhotos from './modules/profile/albumPhotos';
import PhotoViewer from "./modules/photo/photoViewer";
import Report from "./modules/main/report";
import Search from "./modules/main/search";
import People from './modules/user/people';
import Photos from './modules/photo/photos';
import Comment from './modules/feed/components/comment'
import Discover from './modules/feed/components/discover'
import ViewFeed from './modules/feed/components/viewFeed'
import Settings from './modules/user/settings';
import Blogs from './modules/blog/blogs';
import BlogView from './modules/blog/blogView';
import Events from './modules/event/events';
import EventView from './modules/event/eventView';
import Groups from './modules/group/groups';
import GroupView from './modules/group/groupView';
import Pages from './modules/page/pages';
import PageView from './modules/page/pageView';
import Listings from './modules/marketplace/listings';
import ListingView from './modules/marketplace/listingView';

import Videos from './modules/video/videos';
import VideoView from './modules/video/videoView';

import Musics from './modules/music/musics';
import MusicView from './modules/music/musicView';
import Chat from './modules/message/chat';
import ForgotScreen from './modules/auth/forgot'
import Likes from './modules/feed/components/likes';
import Gif from './modules/feed/components/gif';
import Push from './modules/main/push';
import MyWebview from './modules/main/webview';



export const menus = [
    {name : 'home', id : 'main', icon : 'home', color: '#E19494', param: {page: 0}},
    {name : 'search', id : 'search', icon : 'search', color: '#F44336'},
    {name : 'notifications', id : 'main', icon : 'notifications', color: '#00BCD4',param: {page: 2}},
    {name : 'friend_requests', id : 'main', icon : 'md-person-add', color: '#4CAF50',param: {page: 1}},
    {name : 'messages', id : 'main', icon : 'md-mail', color: '#4CAF50',param: {page: 3}},

    {id: 'divider', 'name': 'apps'},
    {name : 'find_friends', id : 'find_friends', icon : 'ios-contacts', color: '#20507E'},
    {name : 'hash_discover', id : 'hash_discover', icon : 'ios-compass', color: '#B25AAA'},
    {name : 'photos', id : 'photo_directory', icon : 'ios-image', color: '#2196F3'},
    {name : 'events', id : 'event', icon : 'md-calendar', color: '#FFEB3B'},
    {name : 'music', id : 'music', icon : 'md-musical-notes', color: '#2196F3'},
    {name : 'videos', id : 'video', icon : 'md-videocam', color: '#4CAF50'},
    {name : 'blogs', id : 'blog', icon : 'md-create', color: '#4D207E'},
    {name : 'pages', id : 'page', icon : 'md-document', color: '#7E4D20'},
    {name : 'groups', id : 'group', icon : 'ios-people', color: '#F44336'},
    {name : 'marketplace_store', id : 'listing', icon : 'md-cart', color: '#FFEB3B'},

];




export default {
    start : {
        screen: Homescreen,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },
    login : {
        screen : LoginScreen,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },

    forgot : {
        screen : ForgotScreen,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },
    signup : {
        screen : SignupScreen,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },

    getstarted : {
        screen : Getstarted,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },

    membership : {
        screen : Membership,
        navigationOptions: {
            drawerLockMode: 'locked-closed'
        }
    },
    logout: LoginScreen,
    main : Mainscreen,
    profile : ProfileScreen,
    editFeed : EditFeed,
    feedEditor : FeedEditor,
    selectFeelings : SelectFeelings,
    selectFriends : SelectFriends,
    albumPhotos : AlbumPhotos,
    photoViewer : PhotoViewer,
    report : Report,
    search : Search,
    find_friends: People,
    photo_directory : Photos,
    comments : Comment,
    viewFeed : ViewFeed,
    hash_discover : Discover,
    settings : Settings,
    blog : Blogs,
    blogView : BlogView,

    event : Events,
    eventView : EventView,

    group : Groups,
    groupView : GroupView,

    page : Pages,
    pageView : PageView,

    listing : Listings,
    listingView : ListingView,

    video : Videos,
    videoView : VideoView,

    music : Musics,
    musicView : MusicView,
    chat : Chat,
    likes : Likes,
    push : Push,
    gif : Gif,

    webview : MyWebview
}