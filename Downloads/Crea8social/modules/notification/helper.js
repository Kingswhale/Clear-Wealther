import React from 'react';
import Util from "../../utils/Util";
import lang from '../../lang';
let _ = require("lodash");
class NotificatioHelper  {

    getTitle(title) {

        if (title !== undefined) return lang.t(title);
    }

    action(item,navigation) {
        if (Util.inArray(item.type, ['music.like','music.like.react','music.dislike','music.like.comment','music.dislike.comment,music.comment.reply'])) {
            //going to music page
            navigation.push('musicView', {
                itemId : item.music[0].id,
                item : item.music[0]
            })
        } else if (Util.inArray(item.type, ['listing.comment'])){
            navigation.push('listingView', {
                itemId : item.listing[0].id,
                item : item.listing[0]
            })
        } else if (Util.inArray(item.type, ['video.processing', 'video.processed', 'video.like', 'video.like.react', 'video.dislike', 'video.like.comment', 'video.dislike.comment', 'video.comment', 'video.comment.reply'])){
            navigation.push('videoView', {
                itemId : item.video[0].id,
                item : item.video[0]
            })
        }  else if (Util.inArray(item.type, [ 'photo.like', 'photo.like.react', 'photo.dislike', 'photo.like.comment', 'photo.dislike.comment', 'photo.comment', 'photo.comment.reply'])){
            navigation.push('photoViewer', {
                photos : [item.photo[0].path],
                selected : item.photo[0].path
            })
        } else if (Util.inArray(item.type, ['page.new.role', 'page.invite'])){
            navigation.push('pageView', {
                itemId : item.page[0].id
            })
        } else if (Util.inArray(item.type, ['group.role', 'group.add.member'])){
            navigation.push('groupView', {
                itemId : item.group[0].id
            })
        } else if (Util.inArray(item.type, ['feed.like', 'feed.like.react', 'feed.dislike', 'feed.like.comment', 'feed.dislike.comment', 'feed.comment', 'feed.comment.reply', 'feed.shared', 'feed.tag', 'post-on-timeline'])){
            navigation.push('viewFeed', {
                item : item.feed[0]
            })
        } else if (Util.inArray(item.type, ['event.rsvp', 'event.events', 'event.invite', 'event.post'])){
            navigation.push('eventView', {
                itemId : item.event[0].id,
                item : item.event[0]
            })
        } else if (Util.inArray(item.type, ['blog.like', 'blog.like.comment', 'blog.comment'])){
            navigation.push('blogView', {
                itemId : item.blog[0].id,
                item : item.blog[0]
            })
        }  else {
            //we are loading for the user
            navigation.push("profile", {
                id : item.userid
            });
        }
    }
}

let notificationHelper = new NotificatioHelper();
export default notificationHelper;