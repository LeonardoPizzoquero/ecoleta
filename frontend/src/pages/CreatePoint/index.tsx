import React, { useEffect, useState, ChangeEvent, FormEvent, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';

import Dropzone from '../../components/Dropzone';

import { LeafletMouseEvent } from 'leaflet';

import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedFile, setSelectedFile] = useState<File>();


  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla);
      
        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);
      
        setCities(cityNames);
      });
  }, [selectedUf]);

  const handleSelectUf = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUf(event.target.value);
  }, []);

  const handleSelectCity = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  }, []);

  const handleMapClick = useCallback((event: LeafletMouseEvent) => {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }, []);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData({...formData, [name]: value})
  }, [formData]);

  const handleSubmit = useCallback(async (event: FormEvent) => {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));
    if (selectedFile) data.append('image', selectedFile);

    await api.post('/points', data);

    alert('Ponto cadastrado com sucesso!');

    history.push('/');
  }, [formData, history, selectedCity, selectedFile, selectedItems, selectedPosition, selectedUf]);

  const handleSelectItem = useCallback((id: number) => {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }, [selectedItems]);

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do<br /> ponto de coleta</h1>
        
        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email" 
                name="email" 
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input 
                type="text" 
                name="whatsapp" 
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map onclick={handleMapClick} center={initialPosition} zoom={15}>
            <TileLayer 
               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                onChange={handleSelectUf} 
                value={selectedUf} 
                name="uf" 
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select 
                onChange={handleSelectCity} 
                value={selectedCity} 
                name="city" 
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))} 
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : '' }
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;