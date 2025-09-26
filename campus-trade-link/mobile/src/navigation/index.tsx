import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import FeedScreen from '../screens/FeedScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Other Screens
import PostDetailScreen from '../screens/PostDetailScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import ConversationScreen from '../screens/ConversationScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Other
  PostDetail: { postId: string };
  ProductDetail: { productId: string };
  UserProfile: { userId: string };
  Search: { initialQuery?: string };
  CreatePost: undefined;
  CreateProduct: undefined;
  Conversation: { conversationId: string };
  EditProfile: undefined;
};

export type MainTabsParamList = {
  Feed: undefined;
  Explore: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen} 
        options={{ tabBarLabel: 'Your Campus' }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show splash screen or loading screen
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={{ headerShown: true, title: 'Post' }}
            />
            <Stack.Screen 
              name="ProductDetail" 
              component={ProductDetailScreen}
              options={{ headerShown: true, title: 'Product' }}
            />
            <Stack.Screen 
              name="UserProfile" 
              component={UserProfileScreen}
              options={{ headerShown: true, title: 'Profile' }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{ headerShown: true, title: 'Search' }}
            />
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen}
              options={{ 
                headerShown: true, 
                title: 'Create Post',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="CreateProduct" 
              component={CreateProductScreen}
              options={{ 
                headerShown: true, 
                title: 'List Product',
                presentation: 'modal',
              }}
            />
            <Stack.Screen 
              name="Conversation" 
              component={ConversationScreen}
              options={{ headerShown: true, title: 'Messages' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                headerShown: true, 
                title: 'Edit Profile',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}