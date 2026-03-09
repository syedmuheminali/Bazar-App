import { useClerk } from '@clerk/expo'
import { useRouter } from 'expo-router'
import { Pressable, Text } from 'react-native'

export const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      router.replace("/sign-in")
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <Pressable
      className="w-full bg-primary py-4 rounded-full items-center mb-10"
      onPress={handleSignOut}
    >
      <Text className='text-white'>Sign out</Text>
    </Pressable>
  )
}