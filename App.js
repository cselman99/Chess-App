import HomeScreen from './Components/HomeScreen';
import EditView from './Components/EditView';
import BoardView from './Components/BoardView';
import PromptView from './Components/PromptView';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  // myTheme = {
  //   ...DefaultTheme,
  //   colors: {
  //     ...DefaultTheme.colors,
  //     primary: '#000',
  //     text: '#fff'
  //   },
  // };

  return (
    <NavigationContainer theme={DarkTheme}>
       <Stack.Navigator>
         <Stack.Screen
           name="PhotoSelect"
           component={HomeScreen}
           options={{ title: 'Home' }}
         />
         <Stack.Screen
            name="PromptView"
            component={PromptView}
            options={{ title: 'Game Questions' }}
          />
         <Stack.Screen
            name="EditView"
            component={EditView}
            options={{ title: 'Edit Board' }}
          />
         <Stack.Screen
            name="BoardView"
            component={BoardView} 
            options={{ title: 'Results' }}
          />
       </Stack.Navigator>
     </NavigationContainer>
    // {/* <HomeScreen /> */}
  );
}
