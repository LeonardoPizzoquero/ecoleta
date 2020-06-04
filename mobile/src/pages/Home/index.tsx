import React, { useCallback, useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import { RectButton } from 'react-native-gesture-handler';
import { 
  View, 
  ImageBackground, 
  Image, 
  Text, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import axios from 'axios';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface UFs {
  label: string;
  value: string;
}

interface Cities {
  label: string;
  value: string;
}


const Home: React.FC = () => {
  const [uf, setUf] = useState('');
  const [city, setCity] = useState('');

  const [ufs, setUfs] = useState<UFs[]>([]);
  const [cities, setCities] = useState<Cities[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => {
          return {
            label: uf.sigla,
            value: uf.sigla,
          }
        });

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (uf === '') {
      return;
    }
    
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => {
          return {
            label: city.nome,
            value: city.nome,
          }
        });
      
        setCities(cityNames);
      });
  }, [uf]);

  const handleNavigateToPoints = useCallback(() => {
    navigation.navigate('Points', {
      uf, 
      city
    });
  }, []);

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground 
        source={require('../../assets/home-background.png')} 
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>
              Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <RNPickerSelect
            placeholder={{
              label: 'Selecione o estado',
              value: null,
              color: '#ddd',
            }}
            items={ufs}
            onValueChange={value => {
              setUf(value);
            }}
            style={{
              ...pickerSelectStyles,
              iconContainer: {
                top: 20,
                right: 12,
              },
            }}
            value={uf}
            Icon={() => {
              return <Icon name="chevron-down" size={20} color="gray" />;
            }}
          />

          <RNPickerSelect
            placeholder={{
              label: 'Selecione a cidade',
              value: null,
              color: '#ddd',
            }}
            items={cities}
            onValueChange={value => {
              setCity(value);
            }}
            style={{
              ...pickerSelectStyles,
              iconContainer: {
                top: 20,
                right: 12,
              },
            }}
            value={city}
            Icon={() => {
              return <Icon name="chevron-down" size={20} color="gray" />;
            }}
          />

          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingRight: 30,
  },
});

export default Home;