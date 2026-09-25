import PostHeader from './PostHeader'
import PostFooter from './PostFooter'
import { Box,Image } from '@chakra-ui/react'
import { useGetUserById } from '../../hooks/useGetUserById';
import { ProfileUrl } from '../../utils/imageUrl';

export default function FeedPost({post,username}) {
    // console.log(post)
    const {
        userProfile,
        profileImageUrl, // Return the profile image URL
        imageLoading, // Return the image loading state
    } = useGetUserById(post.createdBy);
    // console.log(userProfile)
    let url =ProfileUrl(post.postId);
    return (
        <>
            <PostHeader post={post} profileImageUrl={profileImageUrl} creatorProfile={userProfile} imageLoading={imageLoading}/>
            <Box my={2} borderRadius={4} overflow={"hidden"}>
				{url&&<Image src={url} alt={"FEED POST IMG"} />}
			</Box>
            <PostFooter post={post} username={username} isProfilePage={false} creatorProfile={userProfile}/>
        </>
    )
}
