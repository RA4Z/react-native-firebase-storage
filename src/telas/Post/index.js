import { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from "react-native";
import { salvarPost, atualizarPost, deletarPost } from "../../servicos/firestore";
import estilos from "./estilos";
import { entradas } from "./entradas";
import { alteraDados } from "../../utils/comum";
import { IconeClicavel } from "../../componentes/IconeClicavel";
import { salvarImagem } from "../../servicos/storage";
import * as ImagePicker from 'expo-image-picker';

const imagemGalaxia = 'https://img.freepik.com/fotos-gratis/fundo-de-galaxia-espacial_53876-93121.jpg?w=900&t=st=1685568881~exp=1685569481~hmac=9375f278421b19e7ca2260c74cb7e712c7dc0e21c45615e4db6cf761ad653c13'

import uploadImagemPadrao from '../../assets/upload.jpeg';

export default function Post({ navigation, route }) {
    const [desabilitarEnvio, setDesabilitarEnvio] = useState(false);
    const { item } = route?.params || {};

    const [imagem, setImage] = useState(item?.imagemUrl || null);

    const [post, setPost] = useState({
        titulo: item?.titulo || "",
        fonte: item?.fonte || "",
        descricao: item?.descricao || "",
        imagemUrl: item?.imagemUrl || null
    });

    async function salvar() {
        setDesabilitarEnvio(true);

        if (item) {
            await verificarAlteracaoPost();
            return navigation.goBack()  
        } 
        const idPost = await salvarPost({...post, imagemUrl: ''});
        navigation.goBack()  
        if(imagem != null) {
            atualizarPostComImagem(idPost)
        }
    }

    async function verificarAlteracaoPost() {
        if(post.imagemUrl != imagem) {
            atualizarPostComImagem(item.id)
        } else {
            atualizarPost(item.id, post)
        }
    }

    async function atualizarPostComImagem(idPost) {
        const url = await salvarImagem(imagem, idPost)
        await atualizarPost(idPost, {
            imagemUrl: url
        });
    }

    async function escolherImagemDaGaleria() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          console.log(result);

          if (!result.canceled) {
            setImage(result.assets[0].uri);
          }
    }

    return (
        <View style={estilos.container}>
            <View style={estilos.containerTitulo}>
                <Text style={estilos.titulo}>{item ? "Editar post" : "Novo Post"}</Text>
                <IconeClicavel 
                    exibir={!!item} 
                    onPress={() => {deletarPost(item.id); navigation.goBack()}}
                    iconeNome="trash-2" 
                />
            </View>
            <ScrollView style={{ width: "100%" }}>
                {entradas?.map((entrada) => (
                    <View key={entrada.id}>
                        <Text style={estilos.texto}>{entrada.label}</Text>
                        <TextInput
                            value={post[entrada.name]}
                            placeholder={entrada.label}
                            multiline={entrada.multiline}
                            onChangeText={(valor) => 
                                alteraDados(
                                    entrada.name, 
                                    valor, 
                                    post, 
                                    setPost
                                )
                            }
                            style={
                                [estilos.entrada, entrada.multiline && estilos.entradaDescricao]
                            }
                        />
                    </View>
                ))}

                <TouchableOpacity 
                    style={estilos.imagem}
                    onPress={escolherImagemDaGaleria}>
                    <Image
                        source={imagem ? { uri: imagem} : uploadImagemPadrao}
                        style={estilos.imagem}
                    />
                </TouchableOpacity>

            </ScrollView>

            <TouchableOpacity style={estilos.botao} onPress={salvar} disabled={desabilitarEnvio}>
                <Text style={estilos.textoBotao}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}